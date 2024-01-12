package no.gata.web.controller.dtoOut

import no.gata.web.models.GataReportFile

class DtoOutGataReportFile(
    var id: String,
    var data: String?,
    var cloudId: String?,
    var cloudUrl: String?,
) {
    constructor(file: GataReportFile) : this(
        id = file.id.toString(),
        data = file.data,
        cloudId = file.cloudId,
        cloudUrl = file.cloudUrl,
    )
}
