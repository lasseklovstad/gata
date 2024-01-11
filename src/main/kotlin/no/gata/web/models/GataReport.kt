package no.gata.web.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.Lob
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import java.util.Date
import java.util.UUID

@Entity
class GataReport(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    var title: String = "",
    var description: String = "",
    var createdDate: Date = Date(),
    var lastModifiedDate: Date = Date(),
    var lastModifiedBy: String? = null,
    @ManyToOne
    @JoinColumn(name = "created_by")
    var createdBy: GataUser? = null,
    @Lob
    var content: String? = "",
    @OneToMany(mappedBy = "report", cascade = [CascadeType.ALL])
    var files: List<GataReportFile> = emptyList(),
    var type: ReportType = ReportType.DOCUMENT,
)

enum class ReportType {
    DOCUMENT,
    NEWS,
}
