import { expect, type Page } from "@playwright/test";

export const EventActivityPage = (page: Page) => {
   const inputNewPost = page.getByLabel("Nytt innlegg");
   const buttonPublishNewPost = page.getByRole("button", { name: "Publiser innlegg" });
   const listPosts = page.getByRole("list", { name: "Innlegg" });

   const gotoPoll = async (name: string) => {
      await page.getByRole("list", { name: "Aktive avstemninger" }).getByRole("link", { name }).click();
   };

   const createNewPost = async (message: string) => {
      await inputNewPost.fill(message);
      await buttonPublishNewPost.click();
      await expect(inputNewPost).toHaveValue("");
   };

   const getPostListItem = (message: string) => {
      return listPosts.getByRole("listitem").filter({ hasText: message });
   };

   const likePost = async (message: string, type: Like["type"]) => {
      const listItem = getPostListItem(message);
      await listItem.getByRole("button", { name: "Liker" }).click();
      const likePopover = page.getByRole("group", { name: "Velg type" });
      await expect(likePopover).toBeVisible();
      await likePopover.getByRole("radio", { name: type }).click();
      await expect(likePopover).toBeHidden();
   };

   type Like = { type: "Tommel opp" | "Hjerte"; count: number };
   const verifyLikes = async (message: string, likes: Like[]) => {
      const listItem = getPostListItem(message);
      const likeList = listItem.getByRole("list", { name: "Reaksjoner" });
      const likeListItems = likeList.getByRole("listitem");
      await expect(likeListItems).toHaveCount(likes.length);
      for (const like of likes) {
         const likeListItem = likeListItems.filter({ has: page.getByLabel(like.type) });
         await expect(likeListItem).toContainText(like.count.toString());
      }
   };

   const addReply = async (message: string, reply: string) => {
      const inputComment = getPostListItem(message).getByPlaceholder("Legg til en kommentar");
      await inputComment.fill(reply);
      await getPostListItem(message).getByRole("button", { name: "Kommenter" }).click();
      await expect(inputComment).toHaveValue("");
   };

   const verifyReply = async (message: string, reply: string) => {
      const replyList = getPostListItem(message).getByRole("list", { name: "Kommentarer" });
      await expect(replyList.getByRole("listitem").filter({ hasText: reply })).toBeVisible();
   };

   return {
      gotoPoll,
      createNewPost,
      getPostListItem,
      likePost,
      verifyLikes,
      addReply,
      verifyReply,
   };
};
