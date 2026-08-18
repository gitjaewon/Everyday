import base64
import json
from datetime import date, time

from openai import OpenAI
from pydantic import BaseModel

from .config import settings

client = OpenAI(api_key=settings.api_key)

SHIFT_TYPES = ["day", "evening", "night", "off"]

SUBMIT_SHIFTS_TOOL = {
    "type": "function",
    "function": {
        "name": "submit_shifts",
        "description": "근무표 사진에서 인식한 하루 단위 근무 일정을 제출한다",
        "parameters": {
            "type": "object",
            "properties": {
                "shifts": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "work_date": {"type": "string", "description": "YYYY-MM-DD"},
                            "shift_type": {"type": "string", "enum": SHIFT_TYPES},
                            "start_time": {
                                "type": "string",
                                "description": "HH:MM. 확실하지 않으면 생략",
                            },
                            "end_time": {
                                "type": "string",
                                "description": "HH:MM. 확실하지 않으면 생략",
                            },
                            "needs_review": {
                                "type": "boolean",
                                "description": "사진에서 읽기 어렵거나 시각을 특정할 수 없으면 true",
                            },
                            "review_message": {
                                "type": "string",
                                "description": "needs_review가 true일 때 사용자에게 보여줄 사유",
                            },
                        },
                        "required": ["work_date", "shift_type", "needs_review"],
                    },
                },
            },
            "required": ["shifts"],
        },
    },
}


class ShiftOut(BaseModel):
    work_date: date
    shift_type: str
    start_time: time | None = None
    end_time: time | None = None
    needs_review: bool = False
    review_message: str | None = None


def recognize_shifts(
    image_bytes: bytes,
    content_type: str,
    note: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ShiftOut]:
    """근무표 사진을 받아 하루 단위 근무 일정을 인식한다."""
    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    note_line = f"\n참고 사항: {note}" if note else ""
    range_line = (
        f"\n이 근무표는 {start_date.isoformat()}부터 {end_date.isoformat()}까지의 기간이다. "
        "사진에 연/월 표시가 없거나 불분명해도 반드시 이 범위 안의 날짜로 인식해라."
        if start_date and end_date
        else ""
    )

    completion = client.chat.completions.create(
        model=settings.model,
        tools=[SUBMIT_SHIFTS_TOOL],
        tool_choice={"type": "function", "function": {"name": "submit_shifts"}},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "이 이미지는 교대근무자의 근무표 사진이다. "
                            "각 날짜의 근무유형(day/evening/night/off)과 시작·종료 시각을 인식해라. "
                            "셀에 시각이 명시돼 있지 않거나 글씨가 불분명해 확신할 수 없는 날짜는 "
                            "needs_review를 true로 하고 review_message에 이유를 한국어로 짧게 적어라. "
                            "확신이 서는 날짜는 needs_review를 false로 한다."
                            f"{range_line}"
                            f"{note_line}"
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{content_type};base64,{b64_image}"},
                    },
                ],
            }
        ],
    )

    tool_call = completion.choices[0].message.tool_calls[0]
    shifts = json.loads(tool_call.function.arguments)["shifts"]
    return [ShiftOut(**shift) for shift in shifts]
