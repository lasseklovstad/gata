package no.gata.web.controller.dtoOut

import no.gata.web.models.ResponsibilityNote
import java.util.Date

class DtoOutResponsibilityNote(
    var id: String?,
    var lastModifiedDate: Date,
    var lastModifiedBy: String?,
    var text: String,
) {
    constructor(note: ResponsibilityNote) : this(
        id = note.id.toString(),
        lastModifiedDate = note.lastModifiedDate,
        lastModifiedBy = note.lastModifiedBy,
        text = note.text,
    )
}
