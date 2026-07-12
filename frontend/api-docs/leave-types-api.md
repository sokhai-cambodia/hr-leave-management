# Leave Types API Reference---



## Endpoints### PUT `/api/v1/leave-types/{id}`



---Update a leave type by ID.



### GET `/api/v1/leave-types/`#### Parameters



Retrieve a list of leave types.| Name | Type   | In   | Description         | Required |

|------|--------|------|---------------------|----------|

#### Parameters| id   | string | path | Leave type ID (UUID) | Yes      |



| Name   | Type    | In     | Description         | Default |#### Request Body

|--------|---------|--------|---------------------|---------|

| skip   | integer | query  | Number of items to skip | 0       |**Content-Type:** application/json

| limit  | integer | query  | Max items to return     | 100     |

```json

#### Successful Response{

  "code": "string",

**Status:** 200 OK  "name": "string",

**Content-Type:** application/json  "description": "string",

  "is_active": true

```json}

{```

  "data": [

    {##### Request Fields

      "code": "string",

      "name": "string",- `code`: string — Unique code for the leave type (required)

      "entitlement": 0,- `name`: string — Name of the leave type (required)

      "description": "string",- `description`: string — Description of the leave type

      "is_allow_plan": true,- `is_active`: boolean — Whether the leave type is active

      "is_active": true,

      "id": "string"#### Successful Response

    }

  ],**Status:** 200 OK

  "count": 0**Content-Type:** application/json

}

``````json

{

##### Response Fields  "code": "string",

  "name": "string",

- `data`: Array of leave type objects  "description": "string",

  - `code`: string — Unique code for the leave type  "is_active": true,

  - `name`: string — Name of the leave type  "id": "string"

  - `entitlement`: integer — Number of days entitled for this leave type}

  - `description`: string — Description of the leave type```

  - `is_allow_plan`: boolean — Whether this leave type can be used for leave planning

  - `is_active`: boolean — Whether the leave type is active##### Response Fields

  - `id`: string — Unique identifier (UUID)

- `count`: integer — Total number of leave types- `code`: string — Unique code for the leave type

- `name`: string — Name of the leave type

#### Validation Error- `description`: string — Description of the leave type

- `is_active`: boolean — Whether the leave type is active

**Status:** 422 Unprocessable Entity- `id`: string — Unique identifier

**Content-Type:** application/json

#### Validation Error

```json

{**Status:** 422 Unprocessable Entity

  "detail": [**Content-Type:** application/json

    {

      "loc": ["string"],```json

      "msg": "string",{

      "type": "string"  "detail": [

    }    {

  ]      "loc": ["string"],

}      "msg": "string",

```      "type": "string"

    }

##### Error Fields  ]

}

- `detail`: Array of error objects```

  - `loc`: array — Location of the error

  - `msg`: string — Error message##### Error Fields

  - `type`: string — Error type

- `detail`: Array of error objects

#### Example Request  - `loc`: array — Location of the error

  - `msg`: string — Error message

```  - `type`: string — Error type

GET /api/v1/leave-types?skip=0&limit=100

```#### Example Request



#### Example Response```json

{

```json  "code": "ANNUAL",

{  "name": "Annual Leave",

  "data": [  "description": "Paid annual leave",

    {  "is_active": true

      "code": "ANNUAL",}

      "name": "Annual Leave",```

      "entitlement": 14,

      "description": "Paid annual leave",#### Example Response

      "is_allow_plan": true,

      "is_active": true,```json

      "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"{

    }  "code": "ANNUAL",

  ],  "name": "Annual Leave",

  "count": 1  "description": "Paid annual leave",

}  "is_active": true,

```  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"

}

---```



### POST `/api/v1/leave-types/`---



Create a new leave type.### DELETE `/api/v1/leave-types/{id}`



#### Request BodyDelete a leave type by ID.



**Content-Type:** application/json#### Parameters



```json| Name | Type   | In   | Description         | Required |

{|------|--------|------|---------------------|----------|

  "code": "string",| id   | string | path | Leave type ID (UUID) | Yes      |

  "name": "string",

  "entitlement": 0,#### Successful Response

  "description": "string",

  "is_allow_plan": true,**Status:** 200 OK

  "is_active": true**Content-Type:** application/json

}

``````json

{

##### Request Fields  "message": "string"

}

- `code`: string — Unique code for the leave type (required)```

- `name`: string — Name of the leave type (required)

- `entitlement`: integer — Number of days entitled for this leave type (required)##### Response Fields

- `description`: string — Description of the leave type

- `is_allow_plan`: boolean — Whether this leave type can be used for leave planning- `message`: string — Success message

- `is_active`: boolean — Whether the leave type is active

#### Validation Error

#### Successful Response

**Status:** 422 Unprocessable Entity

**Status:** 200 OK**Content-Type:** application/json

**Content-Type:** application/json

```json

```json{

{  "detail": [

  "code": "string",    {

  "name": "string",      "loc": ["string"],

  "entitlement": 0,      "msg": "string",

  "description": "string",      "type": "string"

  "is_allow_plan": true,    }

  "is_active": true,  ]

  "id": "string"}

}```

```

##### Error Fields

##### Response Fields

- `detail`: Array of error objects

- `code`: string — Unique code for the leave type  - `loc`: array — Location of the error

- `name`: string — Name of the leave type  - `msg`: string — Error message

- `entitlement`: integer — Number of days entitled for this leave type  - `type`: string — Error type

- `description`: string — Description of the leave type

- `is_allow_plan`: boolean — Whether this leave type can be used for leave planning#### Example Request

- `is_active`: boolean — Whether the leave type is active

- `id`: string — Unique identifier (UUID)```

DELETE /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6

#### Validation Error```



**Status:** 422 Unprocessable Entity#### Example Response

**Content-Type:** application/json

```json

```json{

{  "message": "Leave type deleted successfully."

  "detail": [}

    {```

      "loc": ["string"],---

      "msg": "string",

      "type": "string"### GET `/api/v1/leave-types/{id}`

    }

  ]Retrieve a leave type by ID.

}

```#### Parameters



##### Error Fields| Name | Type   | In   | Description         | Required |

|------|--------|------|---------------------|----------|

- `detail`: Array of error objects| id   | string | path | Leave type ID (UUID) | Yes      |

  - `loc`: array — Location of the error

  - `msg`: string — Error message#### Successful Response

  - `type`: string — Error type

**Status:** 200 OK

#### Example Request**Content-Type:** application/json



```json```json

{{

  "code": "ANNUAL",  "code": "string",

  "name": "Annual Leave",  "name": "string",

  "entitlement": 14,  "description": "string",

  "description": "Paid annual leave",  "is_active": true,

  "is_allow_plan": true,  "id": "string"

  "is_active": true}

}```

```

##### Response Fields

#### Example Response

- `code`: string — Unique code for the leave type

```json- `name`: string — Name of the leave type

{- `description`: string — Description of the leave type

  "code": "ANNUAL",- `is_active`: boolean — Whether the leave type is active

  "name": "Annual Leave",- `id`: string — Unique identifier

  "entitlement": 14,

  "description": "Paid annual leave",#### Validation Error

  "is_allow_plan": true,

  "is_active": true,**Status:** 422 Unprocessable Entity

  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"**Content-Type:** application/json

}

``````json

{

---  "detail": [

    {

### GET `/api/v1/leave-types/{id}`      "loc": ["string"],

      "msg": "string",

Retrieve a leave type by ID.      "type": "string"

    }

#### Parameters  ]

}

| Name | Type   | In   | Description         | Required |```

|------|--------|------|---------------------|----------|

| id   | string | path | Leave type ID (UUID) | Yes      |##### Error Fields



#### Successful Response- `detail`: Array of error objects

  - `loc`: array — Location of the error

**Status:** 200 OK  - `msg`: string — Error message

**Content-Type:** application/json  - `type`: string — Error type



```json#### Example Request

{

  "code": "string",```

  "name": "string",GET /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6

  "entitlement": 0,```

  "description": "string",

  "is_allow_plan": true,#### Example Response

  "is_active": true,

  "id": "string"```json

}{

```  "code": "ANNUAL",

  "name": "Annual Leave",

##### Response Fields  "description": "Paid annual leave",

  "is_active": true,

- `code`: string — Unique code for the leave type  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"

- `name`: string — Name of the leave type}

- `entitlement`: integer — Number of days entitled for this leave type```

- `description`: string — Description of the leave type# Leave Types API Reference

- `is_allow_plan`: boolean — Whether this leave type can be used for leave planning

- `is_active`: boolean — Whether the leave type is active## Endpoints

- `id`: string — Unique identifier (UUID)

---

#### Validation Error

### GET `/api/v1/leave-types/`

**Status:** 422 Unprocessable Entity

**Content-Type:** application/jsonRetrieve a list of leave types.



```json#### Parameters

{

  "detail": [| Name   | Type    | In     | Description         | Default |

    {|--------|---------|--------|---------------------|---------|

      "loc": ["string"],| skip   | integer | query  | Number of items to skip | 0       |

      "msg": "string",| limit  | integer | query  | Max items to return     | 100     |

      "type": "string"

    }#### Successful Response

  ]

}**Status:** 200 OK

```**Content-Type:** application/json



##### Error Fields```json

{

- `detail`: Array of error objects  "data": [

  - `loc`: array — Location of the error    {

  - `msg`: string — Error message      "code": "string",

  - `type`: string — Error type      "name": "string",

      "description": "string",

#### Example Request      "is_active": true,

      "id": "string"

```    }

GET /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6  ],

```  "count": 0

}

#### Example Response```



```json##### Response Fields

{

  "code": "ANNUAL",- `data`: Array of leave type objects

  "name": "Annual Leave",  - `code`: string — Unique code for the leave type

  "entitlement": 14,  - `name`: string — Name of the leave type

  "description": "Paid annual leave",  - `description`: string — Description of the leave type

  "is_allow_plan": true,  - `is_active`: boolean — Whether the leave type is active

  "is_active": true,  - `id`: string — Unique identifier

  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"- `count`: integer — Total number of leave types

}

```#### Validation Error



---**Status:** 422 Unprocessable Entity

**Content-Type:** application/json

### PUT `/api/v1/leave-types/{id}`

```json

Update a leave type by ID.{

  "detail": [

#### Parameters    {

      "loc": ["string"],

| Name | Type   | In   | Description         | Required |      "msg": "string",

|------|--------|------|---------------------|----------|      "type": "string"

| id   | string | path | Leave type ID (UUID) | Yes      |    }

  ]

#### Request Body}

```

**Content-Type:** application/json

##### Error Fields

```json

{- `detail`: Array of error objects

  "code": "string",  - `loc`: array — Location of the error

  "name": "string",  - `msg`: string — Error message

  "entitlement": 0,  - `type`: string — Error type

  "description": "string",

  "is_allow_plan": true,#### Example Request

  "is_active": true

}```

```GET /api/v1/leave-types?skip=0&limit=100

```

##### Request Fields

#### Example Response

- `code`: string — Unique code for the leave type (required)

- `name`: string — Name of the leave type (required)```json

- `entitlement`: integer — Number of days entitled for this leave type (required){

- `description`: string — Description of the leave type  "data": [

- `is_allow_plan`: boolean — Whether this leave type can be used for leave planning    {

- `is_active`: boolean — Whether the leave type is active      "code": "ANNUAL",

      "name": "Annual Leave",

#### Successful Response      "description": "Paid annual leave",

      "is_active": true,

**Status:** 200 OK      "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"

**Content-Type:** application/json    }

  ],

```json  "count": 1

{}

  "code": "string",```

  "name": "string",

  "entitlement": 0,---

  "description": "string",

  "is_allow_plan": true,### POST `/api/v1/leave-types/`

  "is_active": true,

  "id": "string"Create a new leave type.

}

```#### Request Body



##### Response Fields**Content-Type:** application/json



- `code`: string — Unique code for the leave type```json

- `name`: string — Name of the leave type{

- `entitlement`: integer — Number of days entitled for this leave type  "code": "string",

- `description`: string — Description of the leave type  "name": "string",

- `is_allow_plan`: boolean — Whether this leave type can be used for leave planning  "description": "string",

- `is_active`: boolean — Whether the leave type is active  "is_active": true

- `id`: string — Unique identifier (UUID)}

```

#### Validation Error

##### Request Fields

**Status:** 422 Unprocessable Entity

**Content-Type:** application/json- `code`: string — Unique code for the leave type (required)

- `name`: string — Name of the leave type (required)

```json- `description`: string — Description of the leave type

{- `is_active`: boolean — Whether the leave type is active

  "detail": [

    {#### Successful Response

      "loc": ["string"],

      "msg": "string",**Status:** 200 OK

      "type": "string"**Content-Type:** application/json

    }

  ]```json

}{

```  "code": "string",

  "name": "string",

##### Error Fields  "description": "string",

  "is_active": true,

- `detail`: Array of error objects  "id": "string"

  - `loc`: array — Location of the error}

  - `msg`: string — Error message```

  - `type`: string — Error type

##### Response Fields

#### Example Request

- `code`: string — Unique code for the leave type

```json- `name`: string — Name of the leave type

{- `description`: string — Description of the leave type

  "code": "ANNUAL",- `is_active`: boolean — Whether the leave type is active

  "name": "Annual Leave",- `id`: string — Unique identifier

  "entitlement": 21,

  "description": "Paid annual leave",#### Validation Error

  "is_allow_plan": true,

  "is_active": true**Status:** 422 Unprocessable Entity

}**Content-Type:** application/json

```

```json

#### Example Response{

  "detail": [

```json    {

{      "loc": ["string"],

  "code": "ANNUAL",      "msg": "string",

  "name": "Annual Leave",      "type": "string"

  "entitlement": 21,    }

  "description": "Paid annual leave",  ]

  "is_allow_plan": true,}

  "is_active": true,```

  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"

}##### Error Fields

```

- `detail`: Array of error objects

---  - `loc`: array — Location of the error

  - `msg`: string — Error message

### DELETE `/api/v1/leave-types/{id}`  - `type`: string — Error type



Delete a leave type by ID.#### Example Request



#### Parameters```json

{

| Name | Type   | In   | Description         | Required |  "code": "ANNUAL",

|------|--------|------|---------------------|----------|  "name": "Annual Leave",

| id   | string | path | Leave type ID (UUID) | Yes      |  "description": "Paid annual leave",

  "is_active": true

#### Successful Response}

```

**Status:** 200 OK

**Content-Type:** application/json#### Example Response



```json```json

{{

  "message": "string"  "code": "ANNUAL",

}  "name": "Annual Leave",

```  "description": "Paid annual leave",

  "is_active": true,

##### Response Fields  "id": "3a95f654-5717-45f2-b3fc-2c963f6e0fa6"

}

- `message`: string — Success message```


#### Validation Error

**Status:** 422 Unprocessable Entity
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

##### Error Fields

- `detail`: Array of error objects
  - `loc`: array — Location of the error
  - `msg`: string — Error message
  - `type`: string — Error type

#### Example Request

```
DELETE /api/v1/leave-types/3a95f654-5717-45f2-b3fc-2c963f6e0fa6
```

#### Example Response

```json
{
  "message": "Leave type deleted successfully."
}
```
