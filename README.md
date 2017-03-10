# MockAPI
Mock your APIs online

## BD CONFIG
```
export MOCKAPI_STAGE=DEV
export MOCKAPI_DB_CONNECTION=mongodb://mockapi_user:dev@localhost:27017/mockapi
```

## Create DB user
```
db.createUser(
  {
    user: "mockapi_user",
    pwd: "dev",
    roles: [
       { role: "readWrite", db: "mockapi" }
    ]
  }
)
```