package no.gata.web.controller.dtoOut

import no.gata.web.models.GataUser

class DtoOutSimpleGataUser(
    var id: String?,
    var name: String?,
    var externalUserProviderId: String?,
) {
    constructor(gataUser: GataUser) : this(
        id = gataUser.id.toString(),
        name = gataUser.getPrimaryUser()?.name,
        externalUserProviderId = gataUser.getPrimaryUser()?.id,
    )
}
