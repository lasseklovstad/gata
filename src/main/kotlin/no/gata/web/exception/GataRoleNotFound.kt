package no.gata.web.exception

import no.gata.web.models.UserRoleName

class GataRoleNotFound(roleName: UserRoleName) : RuntimeException("Det finnes ingen rolle: $roleName")
