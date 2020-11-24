# /roles/add
### Role does not exist
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "roleThatDoesNotExist" }' \
  http://localhost:8093/roles/add
```

Expected result
```
HTTP/1.1 400 Bad Request
...
{"result":"role not found"}%
```

### Add role by name
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "<role name>", "user": "<user ID>" }' \
  http://localhost:8093/roles/add
```

Expected result
```
HTTP/1.1 200 OK
...
{"result":"added"}%
```

### Add role by ID
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "<role ID>", "user": "<user ID>" }' \
  http://localhost:8093/roles/add
```

Expected result
```
HTTP/1.1 200 OK
...
{"result":"added"}%
```


# /roles/remove
### Role does not exist
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "roleThatDoesNotExist" }' \
  http://localhost:8093/roles/remove
```

Expected result
```
HTTP/1.1 400 Bad Request
...
{"result":"role not found"}%
```

### Remove role by name
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "<role name>", "user": "<user ID>" }' \
  http://localhost:8093/roles/remove
```

Expected result
```
HTTP/1.1 200 OK
...
{"result":"removed"}%
```

### Remove role by ID
Command
```
curl -i \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "role" : "<role ID>", "user": "<user ID>" }' \
  http://localhost:8093/roles/remove
```

Expected result
```
HTTP/1.1 200 OK
...
{"result":"removed"}%
```
