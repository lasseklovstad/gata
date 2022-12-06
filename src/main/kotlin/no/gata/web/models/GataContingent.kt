package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import jakarta.persistence.*

@Entity
data class GataContingent(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID? = null,
        @Column(columnDefinition = "SMALLINT")
        var year: Int = 0,
        var isPaid: Boolean = false,
        @ManyToOne
        @JoinColumn(name = "gata_user_id")
        @JsonIgnore
        var user: GataUser? = null
)
