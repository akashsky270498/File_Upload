# ⚡ OmniMedia v2 — Complete Technology Interview Q&A

## Project Stack

```text
Frontend
  ↓
React
  ↓
Nginx
  ↓
Node.js + Express + TypeScript
  ├── PostgreSQL + Sequelize
  ├── Redis
  ├── RabbitMQ
  ├── Kafka
  ├── Elasticsearch
  ├── GraphQL
  ├── Socket.IO + Redis Adapter
  └── Cloudinary

Observability
  ├── Prometheus
  ├── Grafana
  ├── Loki
  └── OpenTelemetry + Jaeger

Testing
  ├── Jest
  ├── Supertest
  └── k6

Infrastructure
  └── Docker
```

---

# 1. Node.js

## Q1. What is Node.js?

**Ans:**

Node.js is an open-source, cross-platform JavaScript runtime environment that allows us to run JavaScript outside the browser.

It is built on Google's **V8 JavaScript engine** and uses an event-driven, non-blocking I/O model.

In my project, I used Node.js to build the backend APIs and handle operations like authentication, file upload, search, notifications and communication with databases/external services.

---

## Q2. Why did you use Node.js?

**Ans:**

I already had strong JavaScript/TypeScript backend experience, and Node.js is well suited for I/O-heavy applications.

My application performs many I/O operations:

```text
API
 ↓
PostgreSQL
 ↓
Redis
 ↓
Elasticsearch
 ↓
Kafka/RabbitMQ
 ↓
Cloudinary
```

Node's non-blocking I/O allows the server to handle other requests while waiting for these operations.

---

## Q3. When is Node.js a good choice?

**Ans:**

Node.js is a good choice for:

* REST APIs
* Real-time applications
* Streaming
* Microservices
* I/O-heavy applications
* Applications with many concurrent connections

It is not automatically the best choice for CPU-heavy operations. For CPU-heavy processing, I would use worker processes or a separate service.

---

## Q4. What is the main disadvantage of Node.js?

**Ans:**

CPU-heavy synchronous operations can block the event loop.

For example:

```text
Request
   ↓
Heavy CPU calculation
   ↓
Event Loop blocked
   ↓
Other requests wait
```

For heavy processing, I would move the work to workers/background processes.

---

# 2. Express.js

## Q5. What is Express.js?

**Ans:**

Express.js is a lightweight web framework for Node.js used to build APIs and web servers.

It provides:

* Routing
* Middleware
* Request/response handling
* Error handling
* API structure

I used Express as the HTTP layer of OmniMedia.

---

## Q6. Why Express instead of another framework?

**Ans:**

Express is lightweight, flexible and I already had practical experience with it.

It doesn't force a very heavy architecture, so I could organize the project into modules:

```text
auth
users
files
search
admin
notifications
```

---

## Q7. What is middleware?

**Ans:**

Middleware is a function that runs between receiving the request and sending the response.

Example:

```text
Request
 ↓
Auth Middleware
 ↓
Validation Middleware
 ↓
Controller
 ↓
Response
```

I used middleware for authentication, validation, error handling, logging, CORS and security.

---

# 3. TypeScript

## Q8. Why TypeScript instead of JavaScript?

**Ans:**

TypeScript adds static typing to JavaScript.

For a larger backend, it helps catch many mistakes during development and makes contracts between modules clearer.

Example:

```ts
interface User {
  id: string;
  email: string;
}
```

If I accidentally use the wrong type, TypeScript can detect it before runtime.

---

## Q9. What advantage did TypeScript give you in this project?

**Ans:**

The project has many modules and external integrations.

TypeScript helped maintain clear types for:

```text
API requests
API responses
Database models
Kafka events
RabbitMQ messages
GraphQL types
Services
```

This reduces accidental type mismatches as the project grows.

---

# 4. PostgreSQL

## Q10. What is PostgreSQL?

**Ans:**

PostgreSQL is an open-source relational database management system.

It stores structured data using tables and supports:

* SQL
* Transactions
* Foreign keys
* Indexes
* Constraints
* Joins
* ACID properties
* JSONB

---

## Q11. Why did you use PostgreSQL?

**Ans:**

My application contains related entities:

```text
User
 ↓
Files
 ↓
Tags

User
 ↓
Notifications

User
 ↓
Audit Logs
```

Because these relationships are important, PostgreSQL gives me strong relational integrity using foreign keys and constraints.

---

## Q12. Why PostgreSQL instead of MongoDB?

**Ans:**

MongoDB would also work, but PostgreSQL was more suitable for my relational data model.

For example:

```text
users
files
tags
file_tags
audit_logs
notifications
```

I wanted transactions, foreign keys, joins and database-level constraints.

---

## Q13. What is ACID?

**Ans:**

ACID describes reliable database transactions.

```text
A → Atomicity
C → Consistency
I → Isolation
D → Durability
```

For example, if an operation contains multiple database changes, either the complete transaction succeeds or the database rolls it back.

---

## Q14. Why indexes?

**Ans:**

An index helps the database find rows faster without scanning the entire table.

For example, if I frequently search users by email:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Without a suitable index, PostgreSQL may need to scan many rows.

**Disadvantage:** indexes consume storage and make INSERT/UPDATE operations slightly more expensive because indexes also need to be maintained.

---

# 5. Sequelize

## Q15. What is Sequelize?

**Ans:**

Sequelize is an ORM for Node.js that allows us to interact with relational databases using JavaScript/TypeScript objects and methods.

I used Sequelize between my Node.js application and PostgreSQL.

```text
Node.js
   ↓
Sequelize
   ↓
PostgreSQL
```

---

## Q16. Why Sequelize?

**Ans:**

It reduces repetitive SQL for common CRUD operations and provides:

* Models
* Associations
* Transactions
* Validation
* Query building
* Connection pooling

I can still use raw SQL when I need database-specific or optimized queries.

---

## Q17. ORM disadvantage?

**Ans:**

ORMs can hide the actual SQL being executed.

If a developer doesn't understand SQL, they can accidentally generate inefficient queries.

That's why I would still understand:

```text
JOIN
INDEX
EXPLAIN ANALYZE
TRANSACTIONS
QUERY OPTIMIZATION
```

---

# 6. Redis

## Q18. What is Redis?

**Ans:**

Redis is an in-memory data store that provides very fast access to data and supports data structures such as strings, hashes, lists, sets and sorted sets.

It also supports TTL and atomic operations.

---

## Q19. Why did you use Redis?

**Ans:**

I used Redis for data that requires fast access or temporary/distributed state.

In OmniMedia:

```text
Redis
 ├── Cache
 ├── OTP
 ├── Rate Limiting
 ├── View Counters
 ├── Session/Token State
 └── Socket.IO Adapter
```

---

## Q20. When should Redis be used?

**Ans:**

Redis is useful when:

* Low latency is important
* Data can expire
* Frequent reads happen
* Atomic counters are required
* Shared state is required across application instances

---

## Q21. Why not use a JavaScript object instead?

**Ans:**

An in-memory object belongs to one Node.js process.

If I have:

```text
Node 1 → Memory A
Node 2 → Memory B
Node 3 → Memory C
```

the data isn't shared.

Redis provides shared state:

```text
Node 1 ─┐
Node 2 ─┼── Redis
Node 3 ─┘
```

---

## Q22. What is Redis TTL?

**Ans:**

TTL means Time To Live.

It defines how long a Redis key should exist.

For OTP:

```text
login:otp:user@example.com
       ↓
     123456
       ↓
     TTL = 5 min
```

After the TTL expires, Redis automatically removes the key.

---

## Q23. Redis advantages?

**Ans:**

* Very low latency
* TTL support
* Atomic operations
* Useful data structures
* Shared state across instances
* Excellent for caching and temporary data

---

## Q24. Redis disadvantages?

**Ans:**

* Primarily memory-based, so memory cost can be higher
* Data can be lost depending on persistence/configuration and failure
* Adds another infrastructure dependency
* Cache invalidation can become complex

---

# 7. RabbitMQ

## Q25. What is RabbitMQ?

**Ans:**

RabbitMQ is a message broker used to send messages between producers and consumers.

It is especially useful for background jobs and asynchronous processing.

Basic flow:

```text
Producer
   ↓
Exchange
   ↓
Queue
   ↓
Consumer
```

---

## Q26. Why did you use RabbitMQ?

**Ans:**

I used RabbitMQ for background jobs where the API shouldn't wait for the entire operation.

Examples:

```text
Welcome Email
Login OTP Email
SMS
Media Processing
Cloudinary Cleanup
```

---

## Q27. When should RabbitMQ be used?

**Ans:**

RabbitMQ is useful when:

* Work should happen asynchronously
* Jobs need ACK/NACK
* Retry handling is required
* Different queues need different routing
* Background workers process tasks

---

## Q28. Where exactly did you use RabbitMQ?

**Ans:**

### Registration

```text
Register User
    ↓
PostgreSQL
    ↓
RabbitMQ
    ↓
Email Worker
    ↓
Welcome Email
```

### OTP

```text
Request OTP
    ↓
Redis
    ↓
RabbitMQ
    ↓
Email Worker
    ↓
OTP Email
```

### Cleanup

```text
Cloudinary Cleanup
    ↓
RabbitMQ
    ↓
Cleanup Worker
```

---

## Q29. What is ACK?

**Ans:**

ACK means acknowledgement.

When the consumer successfully processes a message, it sends an ACK.

```text
Message
 ↓
Worker
 ↓
Success
 ↓
ACK
```

The broker can then remove the successfully acknowledged message from the queue.

---

## Q30. What is NACK?

**Ans:**

NACK means the consumer could not successfully process the message.

Depending on configuration, the message can be requeued/retried or dead-lettered.

---

## Q31. What is DLQ?

**Ans:**

DLQ means Dead Letter Queue.

If a message repeatedly fails, instead of continuously retrying it, we can move it to a DLQ.

```text
Queue
 ↓
Consumer
 ↓
Failure
 ↓
Retry
 ↓
Failure
 ↓
DLQ
```

This prevents a bad message from continuously blocking normal processing.

---

## Q32. RabbitMQ advantages?

**Ans:**

* Simple queue-based architecture
* ACK/NACK
* Routing using exchanges
* Retry patterns
* Dead Letter Exchanges/Queues
* Good for worker/job processing

---

## Q33. RabbitMQ disadvantages?

**Ans:**

* Messages are not designed as a long-term event history
* Replay is not its primary strength
* Additional infrastructure to operate
* Retry/DLQ configuration needs careful design

---

# 8. Kafka

## Q34. What is Kafka?

**Ans:**

Apache Kafka is a distributed event streaming platform.

Unlike a traditional job queue, Kafka stores events in topics and consumers track their position using offsets.

Basic architecture:

```text
Producer
   ↓
Kafka Topic
   ↓
Partition
   ↓
Consumer
```

---

## Q35. Why did you use Kafka?

**Ans:**

I used Kafka for **domain/application events**.

For example:

```text
USER_REGISTERED
FILE_UPLOADED
FILE_DELETED
FILE_VIEWED
```

After an event is published, multiple independent consumers can react to it.

---

## Q36. When should Kafka be used?

**Ans:**

Kafka is useful when we need:

* Event streaming
* High-throughput event processing
* Event retention
* Replay
* Multiple independent consumers
* Consumer groups
* Decoupling between producers and consumers

---

## Q37. Where did you use Kafka in OmniMedia?

**Ans:**

After a file is uploaded:

```text
Upload File
    ↓
PostgreSQL
    ↓
FILE_UPLOADED
    ↓
Kafka
    ↓
 ┌──────────────┬──────────────┐
 ↓              ↓              ↓
Search       Analytics     Notification
Worker       Worker         Worker
 ↓              ↓              ↓
Elastic       PostgreSQL    Socket.IO
Search
```

So one event can trigger multiple independent workflows.

---

## Q38. Why Kafka AND RabbitMQ?

**Ans:**

I used them for different responsibilities.

```text
RabbitMQ
→ "Please perform this job."

Kafka
→ "This event happened."
```

RabbitMQ:

```text
Send Email
Send OTP
Cleanup File
Process Media
```

Kafka:

```text
FILE_UPLOADED
FILE_DELETED
USER_REGISTERED
```

Kafka also provides event retention and replay capabilities, which are useful for event-driven workflows.

---

## Q39. Kafka advantages?

**Ans:**

* High throughput
* Event retention
* Replay
* Multiple consumer groups
* Horizontal scalability using partitions
* Good for event-driven architecture

---

## Q40. Kafka disadvantages?

**Ans:**

* More operational complexity
* Partition planning is important
* Consumer offset management
* Duplicate processing must be handled
* Ordering is only guaranteed within a partition

---

## Q41. What is a Kafka partition?

**Ans:**

A Kafka topic is divided into partitions.

```text
file-events
 ├── Partition 0
 ├── Partition 1
 └── Partition 2
```

Partitions allow Kafka to process events in parallel and scale consumers.

---

## Q42. How did you decide the partition key?

**Ans:**

For user-related ordering, I can use `userId` as the key.

```text
user-101 → Partition 1
user-101 → Partition 1
user-101 → Partition 1
```

This keeps events for that key in the same partition.

---

## Q43. Does Kafka guarantee global ordering?

**Ans:**

No.

Kafka guarantees ordering **within a partition**.

It does not guarantee ordering across multiple partitions.

---

## Q44. What if Kafka processes the same event twice?

**Ans:**

Consumers should be idempotent.

I can use a unique event ID:

```text
eventId = abc123
```

The consumer can track processed events and avoid performing the same logical operation twice.

---

# 9. Elasticsearch

## Q45. What is Elasticsearch?

**Ans:**

Elasticsearch is a distributed search and analytics engine built around an inverted index.

It is designed for fast full-text search, filtering, sorting and aggregations.

In OmniMedia, I used Elasticsearch for searching uploaded files.

---

## Q46. Why Elasticsearch?

**Ans:**

The application needs more than simple database lookup.

Users can search using:

```text
Title
Description
Original File Name
Tags
```

They may also need:

```text
Full-text search
Filtering
Sorting
Autocomplete
Relevance
```

Elasticsearch is designed specifically for these search workloads.

---

## Q47. Why not PostgreSQL LIKE/ILIKE?

**Ans:**

PostgreSQL `LIKE`/`ILIKE` can work for simple search.

But as search requirements grow, Elasticsearch provides specialized search capabilities such as:

```text
Inverted Index
Relevance Scoring
Full-text Search
Autocomplete
Filtering
Aggregations
```

So I keep PostgreSQL as the source of truth and Elasticsearch as the search engine.

---

## Q48. Where did you use Elasticsearch?

**Ans:**

When a file is uploaded:

```text
File Upload
    ↓
PostgreSQL
    ↓
Kafka: FILE_UPLOADED
    ↓
Search Consumer
    ↓
Elasticsearch
```

The consumer indexes the searchable file information into Elasticsearch.

When the user searches:

```text
User
 ↓
GraphQL
 ↓
Search Service
 ↓
Elasticsearch
 ↓
Search Results
```

---

## Q49. What is an inverted index?

**Ans:**

An inverted index maps words/terms to the documents containing them.

For example:

```text
Documents:

D1 → "holiday photo"
D2 → "office photo"
D3 → "holiday video"
```

The index conceptually stores:

```text
holiday → D1, D3
photo   → D1, D2
video   → D3
```

So Elasticsearch doesn't need to scan every document for every search.

---

## Q50. What is relevance scoring?

**Ans:**

When multiple documents match a query, Elasticsearch can calculate a relevance score to determine how strongly each document matches the search.

For example:

```text
Search: "holiday"

Document A
Title: holiday photo
→ stronger match

Document B
Description: holiday memories
→ also matches
```

The results can then be ordered based on relevance.

---

## Q51. What is edge_ngram and why did you use it?

**Ans:**

Edge n-gram can generate prefixes from a word.

For example:

```text
"camera"

c
ca
cam
came
camer
camera
```

This can be useful for autocomplete/search-as-you-type behaviour.

So if the user types:

```text
cam
```

Elasticsearch can find terms beginning with that prefix.

---

## Q52. What are Elasticsearch advantages?

**Ans:**

* Fast full-text search
* Relevance scoring
* Inverted indexes
* Filtering
* Sorting
* Aggregations
* Autocomplete
* Distributed scaling

---

## Q53. What are Elasticsearch disadvantages?

**Ans:**

* Additional infrastructure
* Data synchronization with PostgreSQL
* More memory/resource usage
* Index management complexity
* Eventual consistency between DB and search index

---

## Q54. Is Elasticsearch your source of truth?

**Ans:**

No.

```text
PostgreSQL → Source of Truth
Elasticsearch → Search Index
```

If Elasticsearch loses an index, I should be able to rebuild it from PostgreSQL.

---

# 10. GraphQL

## Q55. What is GraphQL?

**Ans:**

GraphQL is an API query language and runtime that allows clients to request exactly the fields they need.

Example:

```graphql
query {
  files {
    id
    title
    views
  }
}
```

---

## Q56. Why did you use GraphQL?

**Ans:**

The application has different screens that may need different fields.

Instead of creating many REST endpoints for every response shape, GraphQL allows the client to request the required fields.

---

## Q57. Why REST + GraphQL together?

**Ans:**

I use REST for operations such as:

```text
Login
Register
Upload
Delete
Admin actions
```

GraphQL is mainly used for flexible read operations.

```text
REST
→ Mutations / Uploads / Actions

GraphQL
→ Flexible Reads
```

---

## Q58. What is N+1 problem?

**Ans:**

Suppose I fetch 100 files and then fetch the owner for every file.

```text
1 query → files
100 queries → users
```

That creates 101 database queries.

DataLoader can batch those requests:

```text
1 query → files
1 batched query → users
```

This reduces unnecessary database calls.

---

# 11. Socket.IO

## Q59. What is Socket.IO?

**Ans:**

Socket.IO is a library for real-time, bidirectional communication between client and server.

It is useful when the server needs to push updates to clients without the client continuously polling.

---

## Q60. Where did you use Socket.IO?

**Ans:**

For real-time notifications.

Example:

```text
File Uploaded
     ↓
Kafka Event
     ↓
Notification Worker
     ↓
Socket.IO
     ↓
React UI
```

The user can immediately receive events such as:

```text
file.uploaded
file.processing
file.processed
notification.created
```

---

## Q61. Why Redis Adapter?

**Ans:**

If I have multiple Node instances:

```text
Client A → Node 1
Client B → Node 2
```

Node 1 needs a way to communicate with Node 2 for broadcasts.

Redis Adapter provides the shared pub/sub mechanism.

```text
Node 1 ─┐
        ├── Redis
Node 2 ─┘
```

---

# 12. Prometheus

## Q62. What is Prometheus?

**Ans:**

Prometheus is a monitoring and metrics system.

It collects time-series metrics such as:

```text
Request Rate
Error Rate
Latency
CPU
Memory
DB Connections
Kafka Lag
RabbitMQ Queue Size
```

---

## Q63. Why did you use Prometheus?

**Ans:**

I wanted visibility into application health and performance.

For example, if API latency increases, Prometheus metrics can show whether:

```text
Requests increased
Errors increased
Database connections increased
```

---

# 13. Grafana

## Q64. What is Grafana?

**Ans:**

Grafana is a visualization and dashboarding tool.

I use it to visualize metrics collected by Prometheus.

Example dashboard:

```text
API RPS
P95 Latency
Error %
CPU
Memory
DB Connections
Kafka Lag
RabbitMQ Queue Depth
```

---

# 14. Loki

## Q65. What is Loki?

**Ans:**

Loki is a log aggregation system designed to work efficiently with Grafana.

It stores and queries logs while primarily indexing labels rather than indexing every word of the log content.

---

## Q66. Why Loki?

**Ans:**

I wanted centralized logs from my application and workers.

Instead of checking every container individually:

```text
API container
Worker container
Kafka consumer
Email worker
```

I can query the logs centrally through Grafana.

---

# 15. OpenTelemetry

## Q67. What is OpenTelemetry?

**Ans:**

OpenTelemetry is a vendor-neutral observability framework used for collecting telemetry such as traces and metrics and propagating context.

For tracing:

```text
Request
 ↓
Express
 ↓
PostgreSQL
 ↓
Kafka
 ↓
Worker
 ↓
Elasticsearch
```

I can follow the flow using trace context.

---

## Q68. Why Jaeger?

**Ans:**

Jaeger provides a UI/backend for distributed traces.

It helps identify where time is being spent.

For example:

```text
Request = 500ms

Express       → 20ms
PostgreSQL    → 80ms
Kafka         → 10ms
Worker        → 200ms
Elasticsearch → 190ms
```

This makes bottlenecks easier to identify.

---

# 16. Nginx

## Q69. What is Nginx?

**Ans:**

Nginx is a web server and reverse proxy.

In my architecture:

```text
Client
  ↓
Nginx
  ↓
Node.js
```

---

## Q70. Why did you use Nginx?

**Ans:**

Nginx can handle:

* Reverse proxy
* TLS termination
* Load balancing
* Request buffering
* Compression
* Edge-level controls

With multiple Node instances:

```text
          ┌── Node 1
Nginx ────┼── Node 2
          └── Node 3
```

---

# 17. Docker

## Q71. Why Docker?

**Ans:**

Docker provides a consistent environment for my application and infrastructure.

Instead of manually installing:

```text
PostgreSQL
Redis
Kafka
RabbitMQ
Elasticsearch
Prometheus
Grafana
Loki
Jaeger
```

I can define them using Docker Compose and start the environment consistently.

---

## Q72. What is a multi-stage Docker build?

**Ans:**

It separates build and runtime environments.

```text
Builder
 ↓
Install dependencies
 ↓
Build TypeScript
 ↓
Runtime Image
 ↓
Only required application/runtime files
```

This can reduce image size and keep unnecessary build tools out of the final runtime image.

---

# 18. Cloudinary

## Q73. Why Cloudinary?

**Ans:**

I use Cloudinary for storing and serving uploaded multimedia files instead of storing large binary files directly inside PostgreSQL.

PostgreSQL stores metadata:

```text
filename
mime type
size
Cloudinary URL
public ID
user ID
```

Cloudinary handles the actual media asset.

---

## Q74. What if Cloudinary succeeds but DB fails?

**Ans:**

I use a compensating action.

```text
Cloudinary Upload
      ↓
SUCCESS
      ↓
PostgreSQL
      ↓
FAIL
      ↓
Delete Cloudinary Asset
```

If cleanup fails, I can send the cleanup task to RabbitMQ for retry.

---

# 19. Authentication — Password + OTP

## Q75. How does password login work?

**Ans:**

```text
Email + Password
      ↓
Find User
      ↓
Compare Password Hash
      ↓
Generate Access Token
      ↓
Refresh Token
```

Passwords are never stored as plaintext.

---

## Q76. How does OTP login work?

**Ans:**

```text
Request OTP
    ↓
Generate OTP
    ↓
Redis + TTL
    ↓
RabbitMQ
    ↓
Email Worker
    ↓
Send OTP
```

Verification:

```text
OTP
 ↓
Redis
 ↓
Validate
 ↓
Delete OTP
 ↓
Generate Tokens
```

---

# 20. JWT

## Q77. What is JWT?

**Ans:**

JWT is a token format used to securely represent claims between parties.

In my application, the access token is short-lived and the refresh token is longer-lived.

```text
Access Token → 15 min
Refresh Token → 7 days
```

---

## Q78. Why short-lived access tokens?

**Ans:**

If an access token is compromised, its lifetime is limited.

The refresh token can be used to obtain a new access token.

This reduces the exposure window of an access token.

---

# 21. Security

## Q79. How did you secure the API?

**Ans:**

I used:

```text
JWT Authentication
RBAC
Password Hashing
HttpOnly Cookies
Rate Limiting
Input Validation
CORS
Helmet
File Validation
File Size Limits
Refresh Token Rotation
Audit Logs
```

---

## Q80. What is RBAC?

**Ans:**

RBAC means Role-Based Access Control.

Instead of checking permissions individually for every user, users are assigned roles.

Example:

```text
USER
ADMIN
```

An admin can access admin-only APIs such as user/file management.

---

# 22. Performance / Scalability

## Q81. How would you handle 10x traffic?

**Ans:**

I would first identify the bottleneck using metrics and traces.

Then:

```text
CPU bottleneck
→ More Node instances

DB read bottleneck
→ Cache + indexes + query optimization

Search bottleneck
→ Elasticsearch scaling/index optimization

Background job backlog
→ More workers

Kafka lag
→ Consumer/partition scaling where appropriate

Redis bottleneck
→ Review memory/commands/scaling
```

I would measure first rather than blindly scaling everything.

---

# 23. Failure Scenarios

## Q82. What if Redis goes down?

**Ans:**

It depends on what Redis is being used for.

For cache:

```text
Redis unavailable
→ Fallback to PostgreSQL
```

For OTP/rate limiting/session state, the affected functionality may fail unless a controlled fallback exists.

---

## Q83. What if RabbitMQ goes down?

**Ans:**

Background jobs cannot be accepted while RabbitMQ is unavailable.

The API should not claim that a job was queued if publishing failed.

Once RabbitMQ recovers, workers can resume processing durable messages.

---

## Q84. What if Elasticsearch goes down?

**Ans:**

Search functionality may become unavailable, but the primary application data should remain safe because PostgreSQL is the source of truth.

After Elasticsearch recovers, I can rebuild/reindex the search index from PostgreSQL.

---

## Q85. What if Kafka goes down?

**Ans:**

Kafka-dependent asynchronous processing can be delayed.

For important DB + event consistency, I would use an Outbox Pattern.

```text
PostgreSQL Transaction
   ├── Save Data
   └── Save Event to Outbox
              ↓
        Event Publisher
              ↓
            Kafka
```

---

# 24. Outbox Pattern

## Q86. Why Outbox Pattern?

**Ans:**

It solves the problem where the database transaction succeeds but publishing the Kafka event fails.

Without Outbox:

```text
DB → SUCCESS
Kafka → FAILURE
```

With Outbox:

```text
BEGIN
 ↓
Save DB Data
 ↓
Save Event in Outbox
 ↓
COMMIT
```

A separate publisher later sends the event to Kafka.

---

# 25. Eventual Consistency

## Q87. Is Elasticsearch immediately consistent with PostgreSQL?

**Ans:**

Not necessarily.

The flow is:

```text
PostgreSQL
 ↓
Kafka
 ↓
Search Consumer
 ↓
Elasticsearch
```

So there can be a small delay between the database update and search index update.

This is eventual consistency.

---

# 26. Testing

## Q88. Why Jest?

**Ans:**

Jest is used for automated JavaScript/TypeScript testing.

I can use it for:

```text
Unit Tests
Integration Tests
Service Tests
Utility Tests
```

---

## Q89. Why Supertest?

**Ans:**

Supertest allows me to test Express endpoints without starting the application as a real external server.

Example:

```text
Supertest
   ↓
Express App
   ↓
API Route
```

It is useful for API integration testing.

---

## Q90. Why k6?

**Ans:**

k6 is used for load/performance testing.

I can simulate multiple users and measure:

```text
RPS
p50 latency
p95 latency
p99 latency
Error rate
```

This helps identify bottlenecks before increasing production traffic.

---

# 27. Most Important "WHY THIS TECHNOLOGY?" Table

| Technology    | What?                   | Why used?                        | OmniMedia usage               |
| ------------- | ----------------------- | -------------------------------- | ----------------------------- |
| Node.js       | JS runtime              | I/O-heavy backend                | API server                    |
| Express       | Node web framework      | Lightweight/flexible API layer   | REST APIs                     |
| TypeScript    | Typed JS                | Type safety                      | Entire backend                |
| PostgreSQL    | Relational DB           | ACID + relationships             | Users/files/tags/audit        |
| Sequelize     | ORM                     | DB abstraction                   | PostgreSQL access             |
| Redis         | In-memory store         | Fast state/TTL/cache             | OTP/cache/rate limit/counters |
| RabbitMQ      | Message broker          | Background jobs                  | Email/OTP/cleanup             |
| Kafka         | Event streaming         | Events/replay/multiple consumers | File/user events              |
| Elasticsearch | Search engine           | Full-text/relevance/autocomplete | File search                   |
| GraphQL       | Query API               | Flexible reads                   | Read operations               |
| Socket.IO     | Real-time communication | Server push                      | Notifications                 |
| Cloudinary    | Media storage/CDN       | Store/serve media                | Uploaded files                |
| Prometheus    | Metrics                 | Monitoring                       | API/system metrics            |
| Grafana       | Dashboard               | Visualization                    | Monitoring dashboards         |
| Loki          | Log aggregation         | Centralized logs                 | Application logs              |
| OpenTelemetry | Observability framework | Distributed tracing              | Request tracing               |
| Jaeger        | Trace backend/UI        | Debug distributed requests       | Trace visualization           |
| Nginx         | Reverse proxy           | Routing/load balancing/TLS       | Edge layer                    |
| Docker        | Containerization        | Reproducible environment         | Local infrastructure          |

---

# 🔥 FINAL INTERVIEW MEMORY

```text
Node.js
→ Runs my backend

Express
→ Handles HTTP/API layer

PostgreSQL
→ Stores source-of-truth data

Sequelize
→ Connects application with PostgreSQL

Redis
→ Fast temporary/shared state

RabbitMQ
→ Background jobs

Kafka
→ Domain events

Elasticsearch
→ Search engine

GraphQL
→ Flexible reads

Socket.IO
→ Real-time communication

Cloudinary
→ Media storage

Prometheus
→ Metrics

Grafana
→ Dashboards

Loki
→ Logs

OpenTelemetry
→ Telemetry/instrumentation

Jaeger
→ Distributed trace visualization

Nginx
→ Reverse proxy/load balancing

Docker
→ Consistent environment
```

# 🧠 Architecture Story to Remember

```text
USER REGISTRATION

Client
 ↓
Express
 ↓
PostgreSQL
 ↓
RabbitMQ
 ↓
Email Worker
 ↓
Welcome Email
```

```text
OTP LOGIN

Client
 ↓
Express
 ↓
Redis
 ↓
RabbitMQ
 ↓
Email Worker
 ↓
OTP
```

```text
FILE UPLOAD

Client
 ↓
Express
 ↓
Cloudinary
 ↓
PostgreSQL
 ↓
Kafka
 ↓
 ┌──────────┬────────────┬──────────────┐
 ↓          ↓            ↓
Elastic   Analytics   Notification
Search      Worker       Worker
                          ↓
                       Socket.IO
                          ↓
                         React
```

```text
SEARCH

Client
 ↓
GraphQL
 ↓
Search Service
 ↓
Elasticsearch
 ↓
Relevant Results
```

```text
MONITORING

Application
 ├── Prometheus → Metrics → Grafana
 ├── Loki → Logs → Grafana
 └── OpenTelemetry → Traces → Jaeger
```
