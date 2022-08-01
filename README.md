# Crawl data LinkedIn

### Yêu cầu hệ thống

### Docker

### Chạy crawl

#### Start container
```dotenv
cd docker
dokcer-compose up -d
cd ..
```

#### Cài đặt libraries cho project (chạy lần đầu khi clone project về)
```dotenv
bash init-project.sh
```

#### Crawl data
```dotenv
bash crawl-data.sh
```

#### Lưu ý:
- Sau khi chạy **run.sh** không huỷ tiến trình 
- Dữ liệu sẽ được lưu ở folder **data-excel** với tên **Linkedin_data_Năm-Tháng-Ngày_Giờ-Phút-Giây**
- Link trang tìm kiếm cuối cùng được lưu ở folder **logs/history-log.txt**