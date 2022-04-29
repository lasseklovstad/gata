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
        var lastModifiedBy: String,
        var text: String,
        @OneToOne
        @JoinColumn(name = "resonsibility_year_id", referencedColumnName = "id")
        @JsonIgnore
        val responsibilityYear: ResponsibilityYear?
){
        fun update(user: GataUser, text:String){
                this.text = text
                lastModifiedBy = user.name
                lastModifiedDate = Date()
        }
}
