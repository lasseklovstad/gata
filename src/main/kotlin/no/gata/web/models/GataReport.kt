package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIncludeProperties
import java.util.*
import jakarta.persistence.*

@Entity
class GataReport (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID? = null,
        var title: String = "",
        var description: String = "",
        var createdDate: Date = Date(),
        var lastModifiedDate: Date = Date(),
        var lastModifiedBy: String? = null,
        @ManyToOne
        @JoinColumn(name="created_by")
        @JsonIncludeProperties("id", "name", "externalUserProviderId")
        var createdBy: GataUser? = null,
        @Lob
        var content: String? = "",
        @OneToMany(mappedBy = "report", cascade = [CascadeType.ALL])
        @JsonIgnore
        var files: List<GataReportFile> = emptyList(),
        var type: ReportType = ReportType.DOCUMENT
)

enum class ReportType {
    DOCUMENT, NEWS
}

interface GataReportSimple {
    var id: UUID?
    var title: String
    var description: String
    var createdDate: Date
    var lastModifiedDate: Date
    var lastModifiedBy: String
}
