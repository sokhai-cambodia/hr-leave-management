# Leave Balances API# Leave Balances API



## Endpoints## Endpoints



### List Leave Balances### List Leave Balances

``````

GET /api/v1/leave-balances?skip=0&limit=100GET /api/v1/leave-balances?skip=0&limit=100

``````



**Parameters:****Response (200 Successful Response):**

- `skip` (query, optional): integer, Default value: 0```json

- `limit` (query, optional): integer, Default value: 100{

  "data": [

**Response (200 Successful Response):**    {

```json      "year": "str1",

{      "balance": 15,

  "data": [      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

    {      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

      "year": "str1",      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",    }

      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  ],

      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "count": 0

      "taken_balance": 0,}

      "balance": 15,```

      "available_balance": 15,

      "owner": {### Create Leave Balance

        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",```

        "full_name": "string",POST /api/v1/leave-balances

        "email": "string"```

      },

      "leave_type": {**Request Body:**

        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",```json

        "code": "string",{

        "name": "string"  "year": "str1",

      }  "balance": 0,

    }  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

  ],  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

  "count": 0}

}```

```

**Response (200 Successful Response):**

### Create Leave Balance```json

```{

POST /api/v1/leave-balances  "year": "str1",

```  "balance": 0,

  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

**Request Body:**  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

```json  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

{}

  "year": "str1",```

  "balance": 0,

  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",### Get My Leave Balance

  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"```

}GET /api/v1/leave-balances/me

``````



**Response (200 Successful Response):****Response (200 Successful Response):**

```json```json

{{

  "year": "str1",  "year": "str1",

  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "balance": 15,

  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

  "taken_balance": 0,  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

  "balance": 0,}

  "available_balance": 0,```

  "owner": {

    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",### Get Leave Balance by ID

    "full_name": "string",```

    "email": "string"GET /api/v1/leave-balances/{id}

  },```

  "leave_type": {

    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",**Parameters:**

    "code": "string",- `id` (path, required): string($uuid)

    "name": "string"

  }**Response (200 Successful Response):**

}```json

```{

  "year": "str1",

### Get My Leave Balance  "balance": 0,

```  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

GET /api/v1/leave-balances/me  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

```  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

}

**Response (200 Successful Response):**```

```json

{### Update Leave Balance

  "data": [```

    {PUT /api/v1/leave-balances/{id}

      "year": "str1",```

      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",**Parameters:**

      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",- `id` (path, required): string($uuid)

      "taken_balance": 0,

      "balance": 15,**Request Body:**

      "available_balance": 15,```json

      "owner": {{

        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "year": "str1",

        "full_name": "string",  "balance": 0,

        "email": "string"  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

      },  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

      "leave_type": {}

        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",```

        "code": "string",

        "name": "string"**Response (200 Successful Response):**

      }```json

    }{

  ],  "year": "str1",

  "count": 1  "balance": 0,

}  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

```  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",

  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"

### Get Leave Balance by ID}

``````

GET /api/v1/leave-balances/{id}

```### Delete Leave Balance

```

**Parameters:**DELETE /api/v1/leave-balances/{id}

- `id` (path, required): string($uuid)```



**Response (200 Successful Response):****Parameters:**

```json- `id` (path, required): string($uuid)

{

  "year": "str1",**Response (200 Successful Response):**

  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",```json

  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",{

  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  "message": "string"

  "taken_balance": 0,}

  "balance": 15,```

  "available_balance": 15,
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  }
}
```

### Update Leave Balance
```
PUT /api/v1/leave-balances/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Request Body:**
```json
{
  "year": "str1",
  "balance": 0,
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response (200 Successful Response):**
```json
{
  "year": "str1",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "taken_balance": 0,
  "balance": 0,
  "available_balance": 0,
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  }
}
```

### Delete Leave Balance
```
DELETE /api/v1/leave-balances/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "message": "string"
}
```
