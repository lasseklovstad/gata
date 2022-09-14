package no.gata.web.controller.dtoOut

import no.gata.web.models.ExternalUser

class DtoOutExternalUser(
        var id: String?,
        var name: String?,
        var email: String,
        var picture: String?,
        var lastLogin: String?,
        var primary: Boolean,
) {
    constructor(externalUser: ExternalUser) : this(
            id = externalUser.id,
            name = externalUser.name,
            email = externalUser.email,
            picture = externalUser.picture,
            lastLogin = externalUser.lastLogin,
            primary = externalUser.primary)
}
