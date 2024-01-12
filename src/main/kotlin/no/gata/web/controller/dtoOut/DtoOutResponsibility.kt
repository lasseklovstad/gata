package no.gata.web.controller.dtoOut

import no.gata.web.models.Responsibility

class DtoOutResponsibility(
    var id: String?,
    var name: String,
    var description: String,
) {
    constructor(responsibility: Responsibility) : this(
        id = responsibility.id.toString(),
        name = responsibility.name,
        description = responsibility.description,
    )
}
