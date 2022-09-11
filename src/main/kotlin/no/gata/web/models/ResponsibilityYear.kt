package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIncludeProperties
import java.time.Year
import java.util.*
import javax.persistence.*

@Entity
data class ResponsibilityYear(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @Column(columnDefinition = "SMALLINT")
        var year: Int,
        @ManyToOne
        @JsonIncludeProperties("id", "name")
        var user: GataUser?,
        @ManyToOne
        @JoinColumn(name = "responsibility_id", referencedColumnName = "id")
        var responsibility: Responsibility,
        @OneToOne(mappedBy = "responsibilityYear", cascade = [CascadeType.ALL])
        var note: ResponsibilityNote?
)
