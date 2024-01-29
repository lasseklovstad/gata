package no.gata.web

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class ReactSpaController {
    /**
     * This must match all the routes in the React application
     */
    @RequestMapping(
        value = [
            "/member/**",
            "/callback/**",
            "/privacy/**",
            "/report/**",
            "/about/**",
            "/reportInfo/**",
            "/responsibility/**",
        ],
    )
    fun redirect(): String? {
        return "forward:/"
    }
}
