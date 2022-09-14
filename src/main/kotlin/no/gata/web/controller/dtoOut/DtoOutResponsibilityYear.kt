package no.gata.web.controller.dtoOut

import no.gata.web.models.ResponsibilityYear

class DtoOutResponsibilityYear(
        var id: String?,
        var year: Int,
        var user: DtoOutSimpleGataUser?,
        var responsibility: DtoOutResponsibility,
        var note: DtoOutResponsibilityNote?
) {
    constructor(responsibilityYear: ResponsibilityYear): this(
            id = responsibilityYear.id.toString(),
            year = responsibilityYear.year,
            user = responsibilityYear.user?.let { DtoOutSimpleGataUser(it) },
            responsibility = DtoOutResponsibility(responsibilityYear.responsibility),
            note = responsibilityYear.note?.let { DtoOutResponsibilityNote(it) }

    )
}
