import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Excel = require('exceljs');
const fs = require('fs')

function exTest(){
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");
    const fileName = `data-excel/${process.env.EXCEL_NAME}.xlsx`;

    worksheet.columns = [
        {header: 'No', key: 'no', width: 10},
        {header: 'Date', key: 'date', width: 20},
        {header: 'PIC', key: 'pic', width: 20},
        {header: 'Company name', key: 'company_name', width: 40},
        {header: 'UpperCase Company name', key: 'uppercase_company_name', width: 40},
        {header: 'Duplicate Company', key: 'duplicate_company', width: 10},
        {header: 'Duplicate Company Status', key: 'duplicate_company_status', width: 10},
        {header: 'Description', key: 'description', width: 40},
        {header: 'Website', key: 'website', width: 20},
        {header: 'Phone number', key: 'phone_number', width: 20},
        {header: 'Emails', key: 'emails', width: 20},
    ];

    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970, 1, 1)});
    worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7)});

    if (!fs.existsSync(fileName)) {
        workbook.xlsx.writeFile(fileName).then(r => {});
        console.log(`File ${fileName}.xlsx created`);
    } else {
        console.log('File existed')
    }
}
exTest();