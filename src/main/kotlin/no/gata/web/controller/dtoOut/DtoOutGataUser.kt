package no.gata.web.controller.dtoOut

import no.gata.web.models.GataUser

class DtoOutGataUser(
    var id: String?,
    var externalUserProviders: List<DtoOutExternalUser>,
    var primaryUser: DtoOutExternalUser?,
    var roles: List<DtoOutGataRole>,
    var contingents: List<DtoOutGataContingent>,
    var subscribe: Boolean,
    var isUserAdmin: Boolean,
    var isUserMember: Boolean,
) {
    constructor(gataUser: GataUser) : this(
        id = gataUser.id.toString(),
        externalUserProviders = gataUser.externalUserProviders.map { DtoOutExternalUser(it) },
        primaryUser = gataUser.getPrimaryUser()?.let { DtoOutExternalUser(it) },
        roles = gataUser.roles.map { DtoOutGataRole(it) },
        contingents = gataUser.contingents.map { DtoOutGataContingent(it) },
        subscribe = gataUser.subscribe,
        isUserAdmin = gataUser.getIsUserAdmin(),
        isUserMember = gataUser.getIsUserMember(),
    )
}
