---
name: vietnamese-writing-style
description: |
  Áp dụng khi người dùng cần viết, chỉnh sửa, hoặc đánh giá văn bản tiếng Việt — bao gồm báo cáo, slide thuyết trình, script nói, luận điểm, phân tích, hay bất kỳ nội dung nào cần ngôn ngữ rõ ràng và lập luận chặt chẽ.

  Trigger khi người dùng:
  - Yêu cầu "viết", "chỉnh", "review", "góp ý" văn bản tiếng Việt
  - Muốn chuyển nội dung sang dạng "nói được" hoặc "đọc được"
  - Cần kiểm tra logic, lập luận, hoặc cấu trúc phân tích
  - Phàn nàn văn bản đang "dài dòng", "khó hiểu", "không logic", "đọc như AI viết"
  - Dùng các từ như: script, slide, báo cáo, thuyết trình, luận điểm, phân tích

  Skill này áp dụng cho mọi ngữ cảnh — không riêng cho lĩnh vực hay dự án cụ thể nào.
---

# Vietnamese Writing & Argumentation Skill

Skill này gồm hai phần:

- **Phần 1 — Ngôn ngữ:** chuẩn mực viết và nói tiếng Việt
- **Phần 2 — Lập luận:** Triad Lens (NMF–IPOD–CV) làm input gate + tiêu chuẩn luận điểm

**Thứ tự bắt buộc:**
```
Input → [Triad Lens gate] → Confirm hệ → Viết / Phân tích → Review
```
Không bỏ qua gate. Input sai kéo output sai, dù lập luận sau đó có chặt đến đâu.

---

## Phần 1 — Ngôn ngữ

### 1.1 Nguyên tắc chung

**Câu ngắn. Ý rõ. Không thừa.**

Mỗi câu chỉ mang một ý. Nếu câu có hai mệnh đề — hỏi: hai ý này có cần đứng cùng không? Nếu không, tách.

**Cấu trúc cơ bản của một đơn vị lập luận:**
```
Luận điểm → Bằng chứng / Lý do → Hệ quả / Kết luận
```
Không đảo thứ tự. Không bắt đầu bằng bằng chứng khi chưa có luận điểm.

**Không padding.** Loại bỏ:
- Câu mở không mang thông tin: "Trong bối cảnh hiện nay...", "Như chúng ta đã biết..."
- Từ nối cơ học dùng để kéo dài chứ không để nối ý: "Bên cạnh đó", "Ngoài ra", "Hơn nữa"
- Câu tổng kết lặp lại điều vừa nói ngay trước đó

**Không hedge thừa.** Phân biệt:
- Hedge có lý do: "Dữ liệu hiện tại cho thấy X, nhưng cần thêm Y để kết luận chắc."
- Hedge để an toàn: "Có thể nói rằng X có vẻ khá..." → cắt.

---

### 1.2 Viết (báo cáo, slide, tài liệu)

**Dùng động từ, không danh từ hóa:**
- Tệ: "Việc thực hiện triển khai hệ thống..."
- Tốt: "Triển khai hệ thống..."

**Hán-Việt:** Dùng khi không có từ thuần Việt tương đương, hoặc khi ngữ cảnh yêu cầu độ chính xác cao. Không dùng để nghe "sang" hơn.
- Tệ: "Tối ưu hóa hiệu suất vận hành của quy trình nội bộ"
- Tốt: "Làm quy trình nội bộ chạy nhanh hơn"

**Không liệt kê robot:** "Thứ nhất... Thứ hai... Thứ ba..." không có logic liên kết → tệ. Liệt kê chỉ dùng khi các mục thực sự song song và không có quan hệ nhân quả. Nếu có quan hệ nhân quả — viết văn xuôi.

**Slide:** Mỗi slide có một luận điểm duy nhất. Bullet trên slide là cụm từ kích hoạt ký ức, không phải câu hoàn chỉnh để đọc. Bullet dài hơn một dòng — đang viết sai.

**Không viết candidate như confirmed.** Nếu một điều chưa được xác nhận, phải nói rõ: "chúng tôi cho rằng...", "dữ liệu ban đầu cho thấy..." Ambiguity không được phép ẩn trong ngôn ngữ trôi chảy.

---

### 1.3 Nói (script thuyết trình)

**Script nói ≠ văn bản đọc to.** Đây là lỗi phổ biến nhất.

**Đặc điểm của câu nói:**
- Ngắn hơn câu viết
- Có nhịp — ngắt ở chỗ người ta thở, không phải ở dấu phẩy văn bản
- Chủ thể rõ ("chúng tôi", "mình", "team") — không bị động hoặc vô nhân xưng
- Có thể bắt đầu bằng "Vậy", "Thực ra", "Ở đây" — tự nhiên khi nói, không dùng trong văn viết chính thức

**Chuyển đoạn bằng ý, không bằng từ nối:**
- Tệ: "Tiếp theo, chúng ta sẽ đến với phần..."
- Tốt: Kết thúc ý trước bằng câu đặt vấn đề → mở ý sau bằng câu trả lời

**Kiểm tra script:** Đọc to. Nếu nghe không tự nhiên — sửa. Nếu phải dừng lấy hơi giữa câu — câu quá dài.

---

## Phần 2 — Lập luận

### 2.0 Triad Lens — Input Gate

Triad Lens là bộ ba lens để mở context *trước khi kết luận*. Nó không nói "thực tại là gì" — nó hỏi "mình đang nhìn qua lăng kính nào, và lăng kính đó có đủ không".

Ba lens: **NMF** (nghĩa), **IPOD** (vận động), **CV** (hình thái / độ ổn định).

**Tại sao phải chạy gate trước:**
Lỗi mapping nhỏ × feedback = cascade lớn. Một giả định sai được lưu lại, promoted thành rule, và tái sử dụng qua nhiều vòng suy luận — đó mới là lỗi nguy hiểm nhất, không phải câu trả lời sai đơn lẻ.

---

#### Bước 0 — Xác định Observation Condition (Ω)

Mọi mapping đều conditional. Trước khi chạy bất kỳ lens nào, xác định:

| Thành phần | Câu hỏi |
|---|---|
| **B — Boundary** | Ranh giới của hệ đang xét là gì? Cái gì thuộc trong, cái gì ngoài? |
| **G — Goal** | Mục tiêu phân tích là gì? (hiểu / đánh giá / viết / quyết định / báo cáo?) |
| **t — Time** | Đang xét thời điểm nào? Hiện tại, quá khứ, hay dự báo? |
| **z — Zoom** | Đang nhìn ở tầng nào? Toàn hệ hay một phần cụ thể? |
| **K — Background** | Context nền là gì? Ai đang nói với ai, trong hoàn cảnh nào? |

Cùng một phát biểu, khác observation condition → khác mapping. Mapping không phải tuyệt đối — nó conditional.

---

#### Bước 1 — Chạy ba lens

**NMF — Naming · Meaning · Framing** *(lens nghĩa — phía chủ thể)*

Tên gọi không mang nghĩa tự thân. Nghĩa được tạo ra bởi tên + framing + observation condition.

Câu hỏi NMF:
- Ta đang gọi cái này bằng tên gì?
- Tên đó mang nghĩa gì — trong frame của ai?
- Nếu đổi framing, nghĩa có đổi không?
- Hai bên đang dùng cùng từ nhưng có đang nói cùng nghĩa không?
- Có meaning drift nào đang xảy ra ngầm không?

Lỗi NMF thường gặp:

| Lỗi | Mô tả |
|---|---|
| Naming error | Gọi sai tên cho đối tượng |
| Meaning error | Tên đúng nhưng nghĩa gán vào sai |
| Framing error | Nghĩa đúng trong frame A bị chuyển sang frame B mà không kiểm tra |
| Frame mixing | Nhiều framing bị xử lý như một |
| Meaning drift | Một từ lặng lẽ đổi nghĩa trong quá trình lập luận |
| Missing framing | Phát biểu nghĩa mà không chỉ rõ frame nào nó đúng |

---

**IPOD — Input · Process · Output · Data** *(lens vận động — khách thể)*

```
Input → Process → Output → Data
              ↑________________|
```

Data là dấu vết, feedback, trạng thái tích lũy từ các vòng trước. Nó quay lại thay đổi Process, hoặc thành Input của vòng tiếp theo. Một phần tử có thể giữ nhiều role cùng lúc, và role thay đổi theo observation condition.

Câu hỏi IPOD:
- Cái gì đi vào hệ? (Input)
- Cái gì xử lý? (Process)
- Kết quả là gì? (Output)
- Cái gì được lưu lại? (Data)
- Output của hệ này có thành Input của hệ khác không?
- Data nào đang nuôi hệ? Data nào đang làm nhiễu nó?
- Có vòng feedback nào đang khuếch đại lỗi không?

Lỗi IPOD thường gặp:

| Lỗi | Mô tả |
|---|---|
| Role error | Gán sai functional role cho phần tử |
| False pipeline | Ép hệ phi tuyến vào chuỗi tuyến tính cứng |
| Missing feedback | Output đúng không được lưu thành Data |
| Bad feedback | Output sai được lưu và tái dùng như Data tốt |
| Cross-system amplification | Lỗi cục bộ lan qua các IPOD chain khác |
| Role freezing | Role đúng trong frame A bị giữ cứng khi sang frame B |

---

**CV — Constant · Variable** *(lens độ ổn định — khách thể)*

Constant và Variable không phải thuộc tính tuyệt đối — chúng là stability role được gán theo observation condition. Cùng một phần tử có thể là Constant ở tầng này và Variable ở tầng khác.

Bốn zone hoạt động:

| Zone | Ý nghĩa | Xử lý |
|---|---|---|
| C/C | Hằng bên trong hằng | Hard rule — có thể dùng lại |
| C/V | Biến bên trong hằng | Conditional rule — cần scope và validation |
| V/C | Hằng bên trong biến | Hidden pattern — có thể học từ nhiều case |
| V/V | Biến bên trong biến | Uncertainty cao — cần thêm evidence |

Câu hỏi CV:
- Cái gì đang tạm ổn định? Ổn định trong scope nào?
- Cái gì đang thay đổi?
- Đâu là rule, đâu chỉ là candidate cần thêm evidence?
- Kết luận này đúng ở scope này — nhưng có đúng ở scope rộng hơn không?
- Có "hằng hết hạn" nào đang được dùng như thể nó vẫn còn hiệu lực không?

Lỗi CV thường gặp:

| Lỗi | Mô tả |
|---|---|
| False constant | Phần tử chưa chắc được xử lý như đã ổn định |
| Wrong scope | Hằng đúng trong scope A bị áp ra ngoài scope đó |
| Ignored variable | Bất ổn định có nghĩa bị bỏ qua |
| Hidden pattern missed | Biến lặp lại nhưng không được học thành hằng có scope |
| Bad promotion | Biến được promote thành hằng khi chưa đủ evidence |

---

#### Bước 2 — Đánh status cho mỗi mapping

Mọi nhận định sau khi chạy lens phải được gán status. Không ẩn ambiguity trong ngôn ngữ trôi chảy.

| Status | Nghĩa |
|---|---|
| `confirmed` | Đủ evidence và validation |
| `candidate` | Hợp lý nhưng chưa validate đủ |
| `ambiguous` | Nhiều cách hiểu còn đang mở |
| `missing_data` | Thiếu input hoặc evidence cần thiết |
| `conflict` | Evidence support cho các mapping mâu thuẫn nhau |
| `needs_review` | Cần người có chuyên môn xem lại |

**Nguyên tắc:** Candidate không được viết như confirmed. Ambiguity không được phép ẩn trong câu văn mượt mà.

---

#### Bước 3 — Hỏi lại hoặc đi tiếp

Sau khi chạy ba lens và gán status:

- Nếu có điểm `missing_data`, `ambiguous`, hoặc `conflict` mà nếu giải sai sẽ đổ toàn bộ phân tích → **hỏi lại trước.**
- Không hỏi hết mọi thứ một lúc. Ưu tiên câu hỏi unblock được nhiều nhất.
- Nếu hệ đã đủ rõ → **chạy Goal Router.**

**Goal Router** — sau khi có Meta Context Map, chọn downstream:

| Route | Khi nào |
|---|---|
| `reason` | Cần suy luận từ map đã có |
| `evaluate` | Cần đánh giá chất lượng / độ đúng |
| `plan` | Cần lập kế hoạch hành động |
| `decide` | Cần đưa ra quyết định |
| `report / write` | Cần viết output từ map đã mở |
| `clarify` | Map chưa đủ, cần hỏi thêm |

---

### 2.1 Tiêu chuẩn của một luận điểm tốt

Một luận điểm phải:

1. **Falsifiable** — có thể sai được. "X giúp cải thiện hiệu quả" không phải luận điểm. "X giảm thời gian xử lý 30% trong điều kiện Y" mới là luận điểm.

2. **Được support thực sự** — bằng chứng phải *support*, không chỉ *related*. Kiểm tra: "Bằng chứng này có thể dùng để support kết luận ngược lại không?" Nếu có — bằng chứng quá yếu.

3. **Có scope rõ** — kết luận áp dụng cho ai, trong điều kiện gì, khi nào. Không có kết luận universally đúng mà không cần điều kiện.

4. **Không circular** — luận điểm không tự chứng minh bằng cách phát biểu lại chính nó.

5. **Status rõ ràng** — luận điểm `candidate` không được trình bày như `confirmed`.

---

### 2.2 Fractal Rule

Ba lens đều có tính fractal. Nếu một phần tử quá vague để xử lý → zoom in thành sub-elements. Nếu map trở nên quá phân mảnh và mất kết nối với goal → zoom out về parent level.

Zoom level thay đổi → semantic, functional, và stability mapping đều có thể thay đổi theo.

---

### Checklist trước khi output

**Ngôn ngữ:**
- [ ] Có câu nào dài hơn 30 chữ mà không cần thiết không?
- [ ] Có từ nào mơ hồ chưa được định nghĩa không? (NMF)
- [ ] Có candidate nào đang được viết như confirmed không? (Status)
- [ ] Có padding / hedge vô lý không?
- [ ] Nếu là script nói — đọc to có tự nhiên không?

**Lập luận:**
- [ ] Observation Condition đã được xác định chưa?
- [ ] Ba lens đã chạy chưa? Còn điểm nào ambiguous / missing_data chưa được xử lý?
- [ ] Mỗi luận điểm có bằng chứng thực sự support nó, hay chỉ related?
- [ ] Scope của kết luận có rõ không? (CV)
- [ ] Có vòng feedback hay Data nào bị bỏ sót không? (IPOD)
- [ ] Có luận điểm nào circular không?

---

## Lưu ý sử dụng

Skill này không phải template áp cứng. Nó là bộ câu hỏi để hỏi trước khi viết và sau khi viết xong.

Không cần chạy đủ ba lens mọi lúc — dùng lens nào giúp mở được chỗ đang tắc.

Ưu tiên: **Rõ trước, đúng sau, đẹp cuối cùng.**
