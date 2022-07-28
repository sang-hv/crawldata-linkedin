# Crawl data LinkedIn

### Yêu cầu hệ thống
```dotenv
node version: v14.18.2

cài đặt chromium
```

### Hướng dẫn cài đặt
```dotenv
npm install
```

### Chạy crawl

#### Nhập link tìm kiếm
```dotenv
EXPORT COMPANY_LIST_LINKEDIN_URL="link tìm kiếm"
```

#### Nhập số trang tìm kiếm trong 1 lần crawl (mặc định 20)
```dotenv
EXPORT LIMIT_PAGE=số_trang
```

#### Crawl data
```dotenv
bash run.sh
```

#### Lưu ý:
- Sau khi chạy **run.sh** không huỷ tiến trình 
- Dữ liệu sẽ được lưu ở folder **data-excel** với tên **Linkedin_data_Năm-Tháng-Ngày_Giờ-Phút-Giây**
- Link trang tìm kiếm cuối cùng được lưu ở folder **logs/history-log.txt**