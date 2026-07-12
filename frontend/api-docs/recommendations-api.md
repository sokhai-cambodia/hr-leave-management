# Recommendations API# Recommendations API



## Endpoints## Endpoints



### Get Leave Plan Recommendations### Get Leave Plan Recommendations

GET /api/v1/recommends/leave-plan?year=2025

`GET /api/v1/recommends/leave-plan`## Recommend Leave Plan API



Retrieve recommended leave plans for a given year.### GET /api/v1/recommends/leave-plan



## ParametersRetrieve recommended leave plans for a given year.



| Name  | In     | Type    | Required | Description                       | Default |#### Parameters

|-------|--------|---------|----------|-----------------------------------|---------|| Name  | In     | Type    | Required | Description                       | Default |

| year  | query  | integer | false    | Year to generate recommendations  | 2025    ||-------|--------|---------|----------|-----------------------------------|---------|

| year  | query  | integer | false    | Year to generate recommendations  | 2025    |

## Responses

#### Responses

### 200: Successful Response

**200: Successful Response**

```json```json

{{

  "leave_type_id": "9fab9f66-9717-4b63-b4fc-3c9b69f8bafeb",  "data": [

  "year": 2025,    {

  "data": [      "leave_date": "2025-11-15",

    {      "bridge_holiday": true,

      "leave_date": "2025-11-08",      "team_workload": 0,

      "bridge_holiday": true,      "preference_score": 0,

      "team_workload": null,      "predicted_score": 0

      "preference_score": null,    }

      "predicted_score": null  ]

    }}

  ]```

}

```**422: Validation Error**

```json

### 422: Validation Error{

  "detail": [

```json    {

{      "loc": ["string"],

  "detail": [      "msg": "string",

    {      "type": "string"

      "loc": ["string"],    }

      "msg": "string",  ]

      "type": "string"}

    }```

  ]

}**Parameters:**

```- `year` (query, integer, required): Year to generate leave recommendations

  - Default: 2025

## Field Descriptions

**Response (200 Successful Response):**

### Response Root```json

{

| Field          | Type   | Description                                    |  "data": [

|----------------|--------|------------------------------------------------|    {

| leave_type_id  | string | UUID of the leave type used for recommendations |      "leave_date": "2025-10-25",

| year           | number | The year for which recommendations are generated |      "leave_period": "FULL_DAY",

| data           | array  | Array of recommendation items                   |      "leave_reason_score": 0.8,

      "predicted_score": 0.9

### Recommendation Item (data array)    }

  ]

| Field            | Type           | Description                                                                 |}

|------------------|----------------|-----------------------------------------------------------------------------|```

| leave_date       | string         | The recommended date for taking leave (ISO 8601 format, e.g., "2025-11-08") |

| bridge_holiday   | boolean\|null  | Whether this date bridges a holiday                                         |**Validation Error (422):**

| team_workload    | number\|null   | Score indicating team workload on this date (0.0 to 1.0, lower is better)   |```json

| preference_score | number\|null   | Score based on user preferences (0.0 to 1.0, higher is better)              |{

| predicted_score  | number\|null   | Predicted approval/success score for the leave request (0.0 to 1.0)         |  "detail": [

    {

## Score Interpretation      "loc": ["string"],

      "msg": "string",

- **team_workload**: Lower values indicate lighter team workload, making it a better time to take leave      "type": "string"

- **preference_score**: Higher values indicate dates that better match user preferences      }

- **predicted_score**: Higher values indicate higher likelihood of leave approval  ]

- **bridge_holiday**: `true` indicates the leave date creates a longer break by bridging holidays/weekends}

```

## Field Descriptions

- `leave_date`: The recommended date for taking leave (ISO 8601 format)
- `leave_period`: The period of leave (e.g., "FULL_DAY", "HALF_DAY_AM", "HALF_DAY_PM")
- `leave_reason_score`: Score indicating the strength of the reason for leave (0.0 to 1.0)
- `predicted_score`: Predicted approval/success score for the leave request (0.0 to 1.0)
