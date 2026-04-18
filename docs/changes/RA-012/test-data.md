# Test Data — RA-012: Upload Project CSV

**Ticket:** RA-012
**Ngày tạo:** 2026-04-18

---

## 1. Files thực (trên disk)

| File | Mô tả | Dùng cho |
|------|-------|---------|
| `docs/changes/RA-012/Raw/projects_25.csv` | 25 rows hợp lệ, đầy đủ fields | BB-03, BB-04, IT-BE-03, IT-BE-04, E2E-01 |

---

## 2. CSV Inline trong Tests (bytes/string)

### TD-01: 1 row hợp lệ tối thiểu (chỉ name)

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b"Minimal Project,,,,,,,"
```

### TD-02: 1 row hợp lệ đầy đủ fields

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b"Full Project,A description,Python,senior,3,active,2026-01-01,2026-12-31"
```

### TD-03: Row headcount = 0

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b"Bad Headcount Project,,,senior,0,planned,,"
```

### TD-04: Row required_level không hợp lệ

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b"Bad Level Project,,,expert,2,planned,,"
```

### TD-05: Row end_date < start_date

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b"Date Error Project,,,,1,planned,2026-06-01,2026-01-01"
```

### TD-06: Row name rỗng

```python
b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
b",,,,1,planned,,"
```

### TD-07: Header thiếu cột name

```python
b"description,required_skills,status\n"
b"Some project,Python,active"
```

### TD-08: 20 valid + 3 invalid rows

```python
# 20 rows valid (name=Project_1 đến Project_20)
# Row 21: headcount=0
# Row 22: required_level=expert
# Row 23: end_date < start_date
```

> Xem `test_csv_ingestion.py` để biết helper function tạo CSV này.

### TD-09: File Latin-1 (non-UTF-8)

```python
# Bytes chứa ký tự Latin-1
b"name\n\xe0\xe1\xe2"  # Không decode được UTF-8
```

### TD-10: File đúng 10MB

```python
header = b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
row = b"Project X,,,,1,planned,,\n"
# Lặp row cho đến khi tổng = 10 * 1024 * 1024 bytes
```

### TD-11: File 10MB + 1 byte

```python
content = b"x" * (10 * 1024 * 1024 + 1)
```

### TD-12: CSV với quoted field chứa dấu phẩy

```python
b'name,description,required_skills,required_level,headcount,status,start_date,end_date\n'
b'"Project A, Phase 2","A desc, with comma","Python,ML",senior,3,active,2026-01-01,2026-12-31'
```

> Dùng để verify `csv.reader` xử lý đúng quoted fields.

---

## 3. DB States (Pre-conditions)

### DS-01: DB rỗng (không có projects)

```
Setup: conftest.py fixture với in-memory SQLite mới → không cần insert gì
```

### DS-02: DB có 25 projects từ projects_25.csv

```
Setup: Upload projects_25.csv một lần trước test → DB có 25 rows
```

### DS-03: DB có project tên "Test Project" với description cũ

```python
# Insert trực tiếp trong test setup
project = Project(name="Test Project", description="Old description", headcount=1, status="planned")
db.add(project)
await db.commit()
```

---

## 4. User Credentials (E2E)

| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `password` |

> Mock JWT — bất kỳ credentials nào cũng được chấp nhận (SD-1 chưa resolve).
