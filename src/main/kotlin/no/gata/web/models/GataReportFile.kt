package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import javax.persistence.*

@Entity
data class GataReportFile(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @ManyToOne
        @JoinColumn(name = "report_id", referencedColumnName = "id")
        @JsonIgnore
        var report: GataReport?,
        @Lob
        var data: String?,
        var cloudId: String?,
        var cloudUrl: String?
)
