import { Request, Router } from "express";
import { Asset, Role, User, uniqueList } from "../sequelize";
import { ClientUser, RoleAttributes, RoleAttributesObject } from "@shared/models";
import AppSystem from "../AppSystem";
import "multer";

namespace AssetController {
  export const router = Router();

  router.get("/view/:name", async (req, res) => {
    Asset.findOne({
      where: {
        name: req.params.name
      }
    }).then(asset => {
      if (asset) {
        asset.sendFile(res);
      } else {
        res.status(404).send();
      }
    });
  });
  
  router.get("/", User.$middleware( { permissions: ["ASSETS_VIEW"] } ), async (req, res) => {
    Asset.findAll().then(assets => {
      res.json(assets.map(a => a.toJSON()));
    });
  });
  
  // router.post("/", User.$middleware( { admin: true } ), AppSystem.uploader.single("file") as any, async (req, res) => {
  router.post("/", AppSystem.uploader.single("file") as any, User.$middleware( { permissions: ["ASSETS_EDIT"] } ), async (req, res) => {
    const file = req.file;
    if (file) {
      const asset = await Asset.registerAsset(file);
      res.json(asset);
    } else {
      res.status(400).send("No file uploaded");
    }
  });

  router.get("/:id", async (req, res) => {
    Asset.findByPk(req.params.id).then(asset => {
      if (asset) {
        res.json(asset);
      } else {
        res.status(404).send();
      }
    });
  });

  router.delete("/:id", User.$middleware( { admin: true } ), async (req, res) => {
    Asset.findByPk(req.params.id).then(async asset => {
      if (asset) {
        await asset.deleteAsset();
        res.status(200).send();
      } else {
        res.status(404).send();
      }
    });
  });
}

export default AssetController;