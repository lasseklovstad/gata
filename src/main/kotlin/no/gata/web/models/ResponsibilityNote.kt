package no.gata.web.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import java.util.Date
import java.util.UUID

@Entity
class ResponsibilityNote(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    var lastModifiedDate: Date = Date(),
    var lastModifiedBy: String? = null,
    @Column(columnDefinition = "TEXT")
    var text: String = "",
    @OneToOne
    @JoinColumn(name = "resonsibility_year_id", referencedColumnName = "id")
    val responsibilityYear: ResponsibilityYear? = null,
) {
    fun update(
        user: GataUser,
        text: String,
    ) {
        val primaryUser = user.getPrimaryUser()
        this.text = text
        if (primaryUser != null) {
            lastModifiedBy = primaryUser.name
        }
        lastModifiedDate = Date()
    }
}
