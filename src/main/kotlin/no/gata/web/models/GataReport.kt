package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIncludeProperties
import java.util.*
import javax.persistence.*

@Entity
data class GataReport(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var title: String,
        var description: String,
        var createdDate: Date,
        var lastModifiedDate: Date,
        var lastModifiedBy: String,
        @ManyToOne
        @JoinColumn(name="created_by")
        @JsonIncludeProperties("id", "name", "externalUserProviderId")
        var createdBy: GataUser?,
        @Lob
        var content: String?,
        @OneToMany(mappedBy = "report", cascade = [CascadeType.ALL])
        @JsonIgnore
        var files: List<GataReportFile>,
        var type: ReportType
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
