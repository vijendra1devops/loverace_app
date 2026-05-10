output "db_connection_strings" {
  value = {for k in var.mssql-server-with-db: k.db_name=> "Driver={ODBC Driver 17 for SQL Server};Server=tcp:${k.sql_server_name }.database.windows.net,1433;Database=${k.db_name};Uid=${k.administrator_login};Pwd=${k.administrator_login_password};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"}
}