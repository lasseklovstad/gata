package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import jakarta.persistence.*

@Entity
class GataReportFile (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID? = null,
        @ManyToOne
        @JoinColumn(name = "report_id", referencedColumnName = "id")
        @JsonIgnore
        var report: GataReport? = null,
        @Lob
        var data: String? = null,
        var cloudId: String? = null,
        var cloudUrl: String? = null
)
