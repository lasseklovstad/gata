package no.gata.web.models

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import java.util.UUID

@Entity
class ResponsibilityYear(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    @Column(columnDefinition = "SMALLINT")
    var year: Int = 0,
    @ManyToOne
    var user: GataUser? = null,
    @ManyToOne
    @JoinColumn(name = "responsibility_id", referencedColumnName = "id")
    var responsibility: Responsibility? = null,
    @OneToOne(mappedBy = "responsibilityYear", cascade = [CascadeType.ALL])
    var note: ResponsibilityNote? = null,
)
