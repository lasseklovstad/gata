package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import javax.persistence.*

@Entity
data class ResponsibilityNote(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        var id: UUID?,
        var lastModifiedDate: Date,
        var lastModifiedBy: String?,
        @Column(columnDefinition = "TEXT")
        var text: String,
        @OneToOne
        @JoinColumn(name = "resonsibility_year_id", referencedColumnName = "id")
        @JsonIgnore
        val responsibilityYear: ResponsibilityYear?
) {
    fun update(user: GataUser, text: String) {
        val primaryUser = user.getPrimaryUser()
        this.text = text
        if (primaryUser != null) {
            lastModifiedBy = primaryUser.name
        }
        lastModifiedDate = Date()
    }
}
