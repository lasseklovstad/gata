package no.gata.web.controller.dtoInn

import no.gata.web.models.ReportType

data class DtoInnGataReport(
        var title: String,
        var description: String,
        var type: ReportType
)
