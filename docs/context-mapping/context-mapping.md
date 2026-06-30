# Context Mapping

This document contains the Context Mapping diagram for the clair-UI (Frontend).

## Context Mapping Diagram

```mermaid
flowchart LR
    %% Context Mapping - Web Application

    title["Context Mapping - Web Application"]

    IAM(("IAM"))
    Device(("Device"))
    Alerting(("Alerting"))
    Analytics(("Analytics"))
    Billing(("Billing"))
    Evaluation(("Evaluation"))
    Notifications(("Notifications"))
    Shared(("Shared Kernel"))

    %% Upstream -> Downstream relationships with ACL
    Device -->|"U -> D [ACL]"| Alerting
    Device -->|"U -> D [ACL]"| Analytics
    Evaluation -->|"U -> D [ACL]"| Analytics

    IAM -->|"U -> D"| Analytics
    IAM -->|"U -> D"| Billing
    IAM -->|"U -> D"| Shared

    Billing -->|"U -> D"| Shared
    Notifications -->|"U -> D [ACL]"| Shared

    %% Shared Kernel Dependencies
    Alerting -.->|"SK"| Shared
    Analytics -.->|"SK"| Shared
    Device -.->|"SK"| Shared
    IAM -.->|"SK"| Shared

    title ~~~ IAM

    classDef context fill:#ff6666,stroke:#000,stroke-width:1.5px,color:#000;
    classDef titleNode fill:transparent,stroke:transparent,color:#000,font-size:22px,font-weight:bold;

    class IAM,Device,Alerting,Analytics,Billing,Evaluation,Notifications,Shared context;
    class title titleNode;
```
