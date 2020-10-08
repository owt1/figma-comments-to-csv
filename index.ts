import fetch from "node-fetch";
import * as stringifySync from "csv-stringify/lib/sync";
import * as fs from "fs";

interface Comment {
  id: string;
  order_id: string;
  parent_id: string;
  name: string;
  message: string;
  url: string;
  created_at: string;
}

async function getComments({ key, token }: Record<"key" | "token", string>) {
  const comments = await fetch(
    `https://api.figma.com/v1/files/${key}/comments`,
    {
      method: "GET",
      headers: {
        "x-Figma-Token": token,
      },
    }
  );
  return comments.json();
}

function generateCsv(comments: Comment[]) {
  const csvString = stringifySync(comments, {
    header: true,
    columns: {
      id: "ID",
      order_id: "pin_id",
      parent_id: "parent_id",
      name: "name",
      message: "message",
      url: "url",
      created_at: "created_at",
    },
    quoted_string: true,
  });
  fs.writeFileSync(`figma_comments.csv`, csvString);
}

getComments({
  key: "",
  token: "",
}).then((res) => {
  const comments = res.comments.map((comment) => {
    return {
      id: comment.id,
      order_id: comment.order_id,
      parent_id: comment.parent_id,
      name: comment.user.handle,
      message: comment.message,
      url: `https://www.figma.com/file/${comment.file_key}?node-id=${
        comment.client_meta?.node_id
      }#${comment.order_id === null ? comment.parent_id : comment.id}`,
      created_at: comment.created_at,
    };
  });
  generateCsv(comments);
});
