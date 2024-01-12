package no.gata.web.models

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.Lob
import jakarta.persistence.ManyToOne
import java.util.UUID

@Entity
class GataReportFile(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    @ManyToOne
    @JoinColumn(name = "report_id", referencedColumnName = "id")
    var report: GataReport? = null,
    @Lob
    var data: String? = null,
    var cloudId: String? = null,
    var cloudUrl: String? = null,
)
