# Crawl data LinkedIn

### Yêu cầu hệ thống

### Docker

### Chạy crawl

#### 1. Start container
```dotenv
bash start-docker-container.sh
```

#### 2. Cài đặt libraries cho project (chạy lần đầu khi clone project về)
```dotenv
bash init-project.sh
```

#### 3. Cấu hình link tìm kiếm 
##### &nbsp; - Tạo file .env 
```dotenv
cp .env.example .env
```
##### &nbsp; - Chỉnh sửa giá trị COMPANY_LIST_LINKEDIN_URL trong file .env
```dotenv
COMPANY_LIST_LINKEDIN_URL=patse_link_tìm_kiếm
```

#### 4. Crawl data
```dotenv
bash crawl-data.sh
```

#### Lưu ý:
- Sau khi chạy **bash crawl-data.sh** không huỷ tiến trình 
- Dữ liệu sẽ được lưu ở folder **data-excel** với tên **Linkedin_data_Năm-Tháng-Ngày_Giờ-Phút**
- Lần crawl data tiếp theo chỉ cần chạy **bash crawl-data.sh**