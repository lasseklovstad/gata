package no.gata.web.controller.dtoOut

import no.gata.web.models.GataRole

class DtoOutGataRole(
    var id: String,
    var name: String,
) {
    constructor(gataRole: GataRole) : this(
        id = gataRole.id.toString(),
        name = gataRole.name,
    )
}
