package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Year
import java.util.*
import javax.persistence.*

@Entity
data class GataContingent(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        @Column(columnDefinition = "SMALLINT")
        var year: Int,
        var isPaid: Boolean,
        @ManyToOne
        @JoinColumn(name = "gata_user_id")
        @JsonIgnore
        var user: GataUser
)
