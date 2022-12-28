package no.gata.web.controller.dtoOut

import no.gata.web.models.GataReport
import no.gata.web.models.ReportType
import java.util.*

class DtoOutGataReportSimple(
        var id: String,
        var title: String,
        var description: String,
        var createdDate: Date,
        var lastModifiedDate: Date,
        var lastModifiedBy: String?,
        var type: ReportType
) {
    constructor(gataReport: GataReport) : this(
            id = gataReport.id.toString(),
            title = gataReport.title,
            description = gataReport.description,
            createdDate = gataReport.createdDate,
            lastModifiedDate = gataReport.lastModifiedDate,
            lastModifiedBy = gataReport.lastModifiedBy,
            type= gataReport.type
    )
}
