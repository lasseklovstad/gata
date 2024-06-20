import {
   addResponsibilityToMember,
   editResponsibility,
   removeResponsibility,
   removeResponsibilityFromMember,
} from "e2e/utils/responsibilityUtils";

import { Environment } from "../../pages/Environment";
import { testWithRoles as test } from "../../utils/fixtures";
import { addLinkedUserWithAdmin, removeLinkedUserWithAdmin } from "../../utils/linkUser";

const env = new Environment();

test("linked member should be able to edit responsibility", async ({ adminPage, memberPage, nonMemberPage }) => {
   test.slow();
   const responsibilityName = "Transportansvarlig";
   await addResponsibilityToMember(
      adminPage,
      {
         name: responsibilityName,
         description: "Tar ansvar for at alle kommer seg til og fra Gata-arrangementer på en trygg måte.",
      },
      env.memberUsername,
      "member"
   );
   await editResponsibility(memberPage, responsibilityName, "Jeg er medlem");
   await addLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);
   await editResponsibility(nonMemberPage, responsibilityName, "Jeg er ikke medlem");

   await removeResponsibilityFromMember(adminPage, responsibilityName, env.memberUsername, "member");
   await removeResponsibility(adminPage, responsibilityName);
   await removeLinkedUserWithAdmin(adminPage, env.memberUsername, env.nonMemberUsername);
});
