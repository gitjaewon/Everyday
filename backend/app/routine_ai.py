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
