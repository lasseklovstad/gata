package no.gata.web.controller.dtoOut

import no.gata.web.models.GataContingent

class DtoOutGataContingent(
    var id: String?,
    var year: Int,
    var isPaid: Boolean,
) {
    constructor(gataContingent: GataContingent) : this(
        id = gataContingent.id.toString(),
        year = gataContingent.year,
        isPaid = gataContingent.isPaid,
    )
}
