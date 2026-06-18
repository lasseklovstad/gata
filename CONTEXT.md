# Gata

Members' site for "gata" — a community of people. Members authenticate through Auth0; a domain **User** can be linked to one or more **External Users** (Auth0 identities).

## Language

**User**:
The domain-level person in gata (table `gata_user`). Carries roles, contingents, responsibilities. May link one or more **External Users**.
_Avoid_: Account, member (member is a role a User can have).

**External User**:
An Auth0 identity (table `external_user`). One **User** can have several. The one stored in the session is the identity the person authenticated with.
_Avoid_: Auth0 user (only in code comments referencing the provider).

**Last active** (`lastSeen` in code):
The last time we observed an **External User** being active on the site (any page load), not the last time they authenticated. Stored on the External User, written by the root loader on every page load. Shown as "Sist aktiv".
_Avoid_: Last login / "Sist innlogget" — misleading because the 400-day session cookie means authentication rarely happens.

## Relationships

- A **User** links one or more **External Users**; one is the primary identity.
- **Last seen** belongs to an **External User**, updated as a side effect of activity, not authentication.

## Flagged ambiguities

- "last login" was used to mean "last time the user was active." Resolved: the concept is **Last seen** (activity), distinct from authentication, which is now rare due to the 400-day session cookie.
