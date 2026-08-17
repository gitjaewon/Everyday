import json
from datetime import date, time

from openai import OpenAI
from pydantic import BaseModel

from .config import settings

client = OpenAI(api_key=settings.api_key)

ROUTINE_ITEM_TYPES = [
    "wake",
    "meal",
    "caffeine_cutoff",
    "prep",
    "work_start",
    "work_end",
    "nap",
    "sleep",
    "exercise",
]

ROUTINE_CHANGE_TYPES = ["new", "changed", "cancelled", "kept"]

SUBMIT_ROUTINES_TOOL = {
    "type": "function",
    "function": {
        "name": "submit_routines",
        "description": "생성한 일일 루틴을 제출한다",
        "parameters": {
            "type": "object",
            "properties": {
                "days": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "work_date": {"type": "string", "description": "YYYY-MM-DD"},
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "type": {"type": "string", "enum": ROUTINE_ITEM_TYPES},
                                        "label": {"type": "string"},
                                        "time": {"type": "string", "description": "HH:MM"},
                                        "note": {"type": "string"},
                                    },
                                    "required": ["type", "label", "time"],
                                },
                            },
                        },
                        "required": ["work_date", "items"],
                    },
                },
            },
            "required": ["days"],
        },
    },
}


class RoutineItemOut(BaseModel):
    type: str
    label: str
    time: time
    note: str | None = None


class DayRoutineOut(BaseModel):
    work_date: date
    items: list[RoutineItemOut]


class RedesignedRoutineItemOut(BaseModel):
    routine_item_id: int | None = None
    category: str
    title: str
    time: time
    note: str | None = None
    change: str


def _shift_to_line(shift) -> str:
    start = shift.start_time.strftime("%H:%M") if shift.start_time else "-"
    end = shift.end_time.strftime("%H:%M") if shift.end_time else "-"
    return f"{shift.work_date} | {shift.shift_type} | {start}~{end}"


def generate_routines(shifts: list) -> list[DayRoutineOut]:
    """일주일치 근무 일정을 받아 하루 단위 루틴 항목을 생성한다."""
    schedule_text = "\n".join(_shift_to_line(s) for s in shifts)

    completion = client.chat.completions.create(
        model=settings.model,
        tools=[SUBMIT_ROUTINES_TOOL],
        tool_choice={"type": "function", "function": {"name": "submit_routines"}},
        messages=[
            {
                "role": "user",
                "content": (
                    "다음은 교대근무자의 근무 일정이다. shift_type은 day/evening/night/off 중 하나다.\n"
                    f"{schedule_text}\n\n"
                    "각 근무일(off 포함)마다 하루 루틴을 생성해라. "
                    "기상, 식사, 카페인 금지, 출근 준비, 근무 시작, 파워냅/수면 등을 근무 시작·종료 시각에 맞춰 배치하고, "
                    "전날/다음날 근무를 고려해 수면 패턴이 자연스럽게 이어지도록 한다. "
                    "카페인은 취침 예정 시각 최소 6시간 전에 끊도록 배치한다. "
                    "label과 note는 반드시 한국어로 작성한다."
                ),
            }
        ],
    )

    tool_call = completion.choices[0].message.tool_calls[0]
    days = json.loads(tool_call.function.arguments)["days"]
    return [DayRoutineOut(**day) for day in days]


def generate_redesigned_routines(
    routine_items: list, incident_type: str, start_time: time, end_time: time
) -> list[RedesignedRoutineItemOut]:
    """Return AI suggestions without mutating the user's saved routine items."""
    routines_text = "\n".join(
        " | ".join(
            [
                f"id={item.id}",
                item.category,
                item.title,
                item.start_time.strftime("%H:%M") if item.start_time else "-",
                item.description or "",
            ]
        )
        for item in routine_items
    ) or "등록된 루틴 없음"

    submit_redesign_tool = {
        "type": "function",
        "function": {
            "name": "submit_redesigned_routines",
            "description": "이상 상황을 반영한 루틴 재설계 제안을 제출한다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "routine_item_id": {"type": "integer"},
                                "category": {"type": "string"},
                                "title": {"type": "string"},
                                "time": {"type": "string", "description": "HH:MM"},
                                "note": {"type": "string"},
                                "change": {
                                    "type": "string",
                                    "enum": ROUTINE_CHANGE_TYPES,
                                },
                            },
                            "required": ["category", "title", "time", "change"],
                        },
                    }
                },
                "required": ["items"],
            },
        },
    }

    completion = client.chat.completions.create(
        model=settings.model,
        tools=[submit_redesign_tool],
        tool_choice={
            "type": "function",
            "function": {"name": "submit_redesigned_routines"},
        },
        messages=[
            {
                "role": "user",
                "content": (
                    "다음은 교대근무자의 오늘 루틴이다.\n"
                    f"{routines_text}\n\n"
                    f"{start_time.strftime('%H:%M')}~{end_time.strftime('%H:%M')}에 "
                    f"{incident_type} 이상 상황이 발생했다. 안전과 휴식을 우선해 루틴 "
                    "변경안을 제안하라. 기존 루틴을 유지하면 change=kept, 시간을 바꾸면 "
                    "changed, 취소하면 cancelled, 새 항목이면 new로 표시하라. "
                    "routine_item_id는 기존 항목을 변경할 때만 포함하고, title과 note는 한국어로 작성하라."
                ),
            }
        ],
    )
    tool_call = completion.choices[0].message.tool_calls[0]
    items = json.loads(tool_call.function.arguments)["items"]
    return [RedesignedRoutineItemOut(**item) for item in items]
