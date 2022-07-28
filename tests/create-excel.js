import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Excel = require('exceljs');

async function exTest(){
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    worksheet.columns = [
        {header: 'Id', key: 'id', width: 10},
        {header: 'Name', key: 'name', width: 32},
        {header: 'D.O.B.', key: 'dob', width: 15,}
    ];

    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970, 1, 1)});
    worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7)});

   // save under export.xlsx
    await workbook.xlsx.writeFile('data-excel/export.xlsx');


    let nameFileExcel = 'data-excel/export.xlsx'
    workbook.xlsx.readFile(nameFileExcel)
        .then(function()  {
            const worksheet = workbook.getWorksheet("My Sheet");
            let lastRow = worksheet.lastRow.number;
            const getRowInsert = worksheet.getRow(++lastRow);
            getRowInsert.getCell('A').value = 'New Value \n 4324';
            getRowInsert.commit();
            return workbook.xlsx.writeFile(nameFileExcel);
        });

    console.log("File is written");
}
exTest();