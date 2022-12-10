package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIncludeProperties
import java.util.*
import jakarta.persistence.*

@Entity
class ResponsibilityYear (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID? = null,
        @Column(columnDefinition = "SMALLINT")
        var year: Int = 0,
        @ManyToOne
        @JsonIncludeProperties("id", "name")
        var user: GataUser? = null,
        @ManyToOne
        @JoinColumn(name = "responsibility_id", referencedColumnName = "id")
        var responsibility: Responsibility? =  null,
        @OneToOne(mappedBy = "responsibilityYear", cascade = [CascadeType.ALL])
        var note: ResponsibilityNote? = null
)
