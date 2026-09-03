# Decision record — WorldPosta and AWS partner claims (2026-09-03)

**Decided by:** Product owner (git user MoAtef, devai@roaya.co), in-session confirmation on
2026-09-03, following `memory-bank/Audit/AI_Readiness_P1_2026-09-02.md` and the open items in
`2026-09-02-pending-decisions.md`.

## Decision

The product owner confirms both partner claims as accurate and approved for publication:

| Claim | Where it is published |
|---|---|
| Roaya is the **Exclusive MENA partner of WorldPosta** | About page story and partnership section, `llms.txt`, WorldPosta service page, Service Facts |
| Roaya is an **AWS Advanced Tier Services Partner** | AWS service page hero, FAQ and Service Facts |

The WorldPosta claim was already `verified` in the registry. The AWS claim was previously
unregistered and published anyway; it is now registered, so any change to the wording is
caught by `approved-factual-consistency`.

## What this confirmation is, and what it is not

It is **first-party approval**: the owner attests the claims are true and accepts them being
published. That is what the claim registry needs, and it is now recorded.

It is **not the external corroboration P2 asks for**. Checked on 2026-09-03:

| Source | Result |
|---|---|
| `worldposta.com` | Does not name Roaya anywhere. No partners page exists. |
| AWS Partner Finder | No public Roaya profile found. |
| Public web | Roaya's own LinkedIn and Facebook state the WorldPosta partnership; both are first-party. |

So a buyer, or an assistant, currently has no way to verify either claim from a source that
is not Roaya. That is precisely the gap P2 exists to close, and it cannot be closed from this
repository — it needs WorldPosta and AWS to publish something.

## Actions this confirmation does NOT complete

These stay open and belong to partner relations, not engineering:

1. **Ask WorldPosta to publish a partner listing** naming Roaya and linking to `roaya.co`.
   Their site has no partners page at all today, so this may mean asking them to create one.
2. **Publish the AWS Partner Finder profile** and link to it from `/services/aws`. The tier
   claim is materially stronger once it resolves to an AWS-hosted page.
3. When either URL exists, add it to the page as a visible evidence link and record it in the
   claim's `decisionReference`.

## External profile inconsistency found while checking

A public third-party company profile describes Roaya as serving **"over 300 clients"** and
lists **CloudSpace** among its products. Both conflict with governed positions: the site
publishes **150+ clients** (registry claim `clients-150-plus`), and `cloudspace-definition-taxonomy`
is **blocked** pending an approved definition. Whoever owns external profiles should correct
or retire that listing — see `2026-09-02-pending-decisions.md` item 11.
