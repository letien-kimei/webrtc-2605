var conn = require("../../config/connect");
    //*, DATE_FORMAT(created_at, '%d/%m/%Y') as created_at
    // const columns = set_is_object.keys(object);
    // const values = set_is_object .values(object);
    class queryModel {  
        constructor() {
            this.table = "";
        }
       
        // LẤY
        get(object,async = true, callback = null) { // async : true( sử dụng đồng bộ), false (bất đồng bộ)
            //object = {
            //    select    : "",
            //    where     : "",
            //    orderby   : "",
            //    limit     : {start: 0, end: 0},
            //    join      : [
            //                    {
            //                        type : "LEFT JOIN",, LEFT JOIN, RIGHT JOIN, INNER JOIN ...,
            //                        table: "tbl_user",
            //                        on   : "ON"
            //                        condition: "tbl_user.id = tbl_module.id "
            //                    }
            //                ]
            //     groupby  : ""
           // }
            if(typeof object === 'object' )
            {
                if(Object.keys(object).length === 0 )
                {
                    object.select = "*";
                }
                let query = `SELECT ${object.select} FROM ${this.table} `;
               
                // JOIN 
                    if(object.join != undefined)
                    {
                        (object.join).map((obj,key)=>{
                            query +=` ${obj.type} ${obj.table} ${obj.on} ${obj.condition}`;
                        });
                    
                    }
                // WHERE 
                    if(object.where != undefined)
                    {
                        query +=` WHERE ${object.where}`;
                    }
                // ORDER BY
                    if(object.orderby != undefined)
                    {
                        query +=` ORDER BY ${object.orderby}`;
                    }
                // LIMIT 
                    if(object.limit != undefined)
                    {
                        query +=` LIMIT ${object.limit.start}, ${object.limit.end}`;
                    }
                // SỬ DỤNG ĐỒNG BỘ
                if(async == true)
                {
                    return new Promise((resolve,reject)=>{
                        conn.getConnection(function (err,connection) { 
                               if (err) throw err;
                                    connection.query(query, (err, res) => {
                                        if (err) {
                                            resolve({ type: "error", data: "Mất kết nối" });
                                        } else {
                                            resolve({ type: "success", data: res });
                                        }
                                    });
                                    connection.release();
                            });

                    });                    
                }
                else // BẤT ĐỒNG BỘ
                {
                    conn.getConnection(function (err,connection) { 
                        connection.query(query,callback);
                        connection.release();
                    });
                }
   
            }else
            {
                console.log("DỮ LIỆU PHẢI LÀ OBJECT");
            }
        }
        // THÊM MỘT HÀNG
        add(data,async = true, callback = null)     // async : true( sử dụng đồng bộ), false (bất đồng bộ)
        {
            let query = `INSERT INTO ${this.table} SET ?`;
            if(async == true) 
            {
                return new Promise(function (resolve, reject) {
                    conn.getConnection(function (err,connection) { 
                        connection.query(query, data, function (err, res, fields) {
                            if (err) {
                                reject(err);
                                return;
                            } else {
                                resolve({ type: "success", insertId: res.insertId });
                            }
                        });
                        connection.release();
                    });
                   
                });
            }else
            {
                conn.getConnection(function (err,connection) { 
                    connection.query(query,data,callback);
                    connection.release();
                });
            }
        
        }
        // THÊM NHIỀU HÀNG
        add_more(data,async = true, callback = null) //[{},{},{}] // async : true( sử dụng đồng bộ), false (bất đồng bộ)
        {
            let columns;
            let values;
            let joinColumns;
            let strValue = "";
            columns = Object.keys(data[0]);
            joinColumns  = "("+columns.join()+")";
            //==================================================================
            data.map((obj,key)=>{
                values      =  Object.values(obj);
                let item = "(";
                values.map((obj,key)=>{
                    item += `'${obj}',`;
                });
                item  = item.substring(",", item.length - 1);
                item += "),";
                strValue += item;
            });
            strValue  = strValue.substring(",", strValue.length - 1);
            //====================================================================
            let query = `INSERT INTO ${this.table}${joinColumns} VALUES ${strValue}`;
            if(async == true) 
            {
                return new Promise(function (resolve, reject) {
                    conn.getConnection(function (err,connection) { 
                        connection.query(query, function (err, res, fields) {
                            if (err) {
                                reject(err);
                                return;
                            } else {
                                resolve({ type: "success", insertId: res.insertId });
                            }
                        });
                        connection.release();
                    });
                
                });                
            }else
            {
                conn.getConnection(function (err,connection) { 
                    connection.query(query,callback);
                    connection.release();
                });
            }

        }
        // CẬP NHẬT
        update(setObject,whereString,async = true, callback = null){   // async : true( sử dụng đồng bộ), false (bất đồng bộ)
            let query = `UPDATE ${this.table} SET ? WHERE ${whereString}`;
            if(async == true) 
            {
                return new Promise(function (resolve, reject) {
                    conn.getConnection(function (err,connection) { 
                        connection.query(query,setObject, (err, res) => {
                            if (err) {
                                reject(err);
                                return;
                            }else
                            {
                                resolve({ "type": "success"});
                            }
                        });
                        connection.release();
                    });
                });                
            }else
            {
                conn.getConnection(function (err,connection) { 
                    connection.query(query,setObject,callback);
                    connection.release();
                    
                });
            }
         
        
        }
        // XOÁ
        delete(whereString)
        {
            let query = `DELETE FROM  ${this.table} WHERE ${whereString}`;
            return new Promise(function (resolve, reject) {
                conn.getConnection(function (err,connection) { 
                    connection.query(query, (err, res) => {
                        if (err) {
                            reject(err);
                            return;
                        }else
                        {
                            resolve({ "type": "success"});
                        }
                    });
                    connection.release();
                });

            });
        }
        where_not_in(object,async = true,callback = null){
            if(typeof object === 'object' )
            {   
                if(Object.keys(object).length === 0 )
                {
                    object.select = "*";
                }
                let query = `SELECT ${object.select}${object.formatdate === true && object.formatdate !== undefined?',DATE_FORMAT(created_at, "%d/%m/%Y")as created_at':''}  FROM ${this.table} `;
                if (object.where !== undefined) {
                    query += `WHERE ${object.where}`
                }
              
                if(async == true)
                {
                    return new Promise ((resolve,reject)=>{
                        conn.getConnection(function(err,connection){
                            connection.query(query,(err,result)=>{
                                if(err){
                                    reject(err);
                                    return;
                                }
                                else{
                                    resolve({ type: "success", data: result });
                                }
                            });
                            connection.release();
                        });
                    });
                }
                else{
                    conn.getConnection(function(err,connection){
                        connection.query(query,callback);
                        connection.release();
                    });
                }
            }
            else{
                console.log("DỮ LIỆU PHẢI LÀ OBJECT");
            }
        }
         // select Max
        select_max(object,async = true,callback = null){
            if (typeof object ==="object") {
                if(Object.keys(object).length === 0 )
                {
                    object.select = "*";
                }
                let query = `SELECT MAX(${object.select}) as max FROM ${this.table}`;
                if (object.where !== undefined) {
                    query += `where ${object.where}`;
                }
                if (async == true) {
                    return new Promise ((resolve,reject)=>{
                      conn.getConnection(function(err,connection){
                        connection.query(query,(err,result)=>{
                                if(err){
                                    reject(err);
                                    return;
                                }
                                else{
                                    resolve({ type: "success", data: result[0] });
                                }
                            });
                            connection.release();
                        });
                    });
                }
                else{
                    conn.getConnection(function(err,connection){
                        connection.query(query,callback);
                        connection.release();
                    });
                }
            }
            else{
                console.log("DỮ LIỆU PHẢI LÀ OBJECT");
            }
        
        }
    }
module.exports = queryModel;