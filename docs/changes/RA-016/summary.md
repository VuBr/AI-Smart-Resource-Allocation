# Yêu cầu cập nhật LLMScoringService

## Thông tin ticket

Tên ticket: RA-016

---

# Mục tiêu

Loại task: refactor + nâng cấp business logic scoring

Chuyển `LLMScoringService` từ:
- static mock scoring

thành:
- hybrid scoring system (rule-based + Gemini LLM refinement)

để phục vụ:
- allocation recommendation
- engineer ranking
- AI matching pipeline

---

# Định nghĩa yêu cầu

Hiện tại `LLMScoringService` chỉ trả về dữ liệu mock cố định:

```python
{
    "score": 0.75,
    "skill_match": 0.80,
    "experience_match": 0.70,
    "availability_match": 0.75,
}
```

Logic này không phản ánh:
- skill overlap thực tế
- engineer availability
- level compatibility
- bench risk
- semantic matching

Cần nâng cấp service để tính score thật dựa trên dữ liệu Engineer + Project.

---

# Yêu cầu chính

## 1. Rule-Based Scoring

Service phải tính:
- skill_match
- experience_match
- availability_match
- final score

### Skill Match
- so sánh:
  - primary_skill
  - secondary_skills
  - project required_skills
- bonus nếu primary_skill match

### Experience Match
- dựa trên:
  - engineer level
  - project required_level
  - years_of_experience

### Availability Match
- dựa trên:
  - availability_percentage
  - active allocations hiện tại

### Risk Penalty
- giảm score nếu engineer có:
  - medium bench risk
  - high bench risk

---

## 2. Gemini LLM Refinement

Nếu config:

```env
LLM_PROVIDER=gemini
```

thì service sẽ:
- gửi baseline scoring vào Gemini
- cho phép Gemini refine score nhẹ
- generate explanation/risk_notes

LLM không được:
- thay đổi quá mạnh baseline
- trả response ngoài JSON format

---

## 3. Safe Fallback

Nếu Gemini fail:
- invalid JSON
- timeout
- missing API key
- API exception

→ phải fallback về rule-based scoring.

System không được crash.

---

# Formula Scoring

```python
final_score =
    0.50 * skill_match +
    0.25 * experience_match +
    0.25 * availability_match -
    risk_penalty
```

---

# Các method chính

| Method | Purpose |
|---|---|
| `_compute_skill_match()` | tính skill score |
| `_compute_experience_match()` | tính experience score |
| `_compute_availability_match()` | tính availability |
| `_compute_risk_penalty()` | bench penalty |
| `_maybe_call_llm()` | gọi Gemini |
| `_clamp()` | normalize score |

---

# Output mong muốn

Service trả về:

```python
MatchScore
```

Bao gồm:
- score
- skill_match
- experience_match
- availability_match
- explanation
- risk_notes
- llm_provider
- model_version

---

# Ví dụ flow mong muốn

```text
Engineer + Project
        ↓
Rule-based scoring
        ↓
Optional Gemini refine
        ↓
Final MatchScore
```

---

# Constraints

- Không remove fallback logic
- Score phải luôn nằm trong range:
  - 0.0 → 1.0
- Không cho phép LLM trả free-text ngoài JSON
- Không log PII
- Preserve existing MatchScore structure

---

# Known Limitations

Hiện tại:
- chưa có Redis cache
- chưa có retry logic
- Gemini SDK đang sync
- skills chưa normalize

---

# Future Improvements

- Redis caching
- async Gemini client
- retry/backoff
- embedding similarity
- skill taxonomy
- ML ranking