import React from "react";
import BaseApi from "./BaseApi";
import { RoleAttributes, ClientUser, RoleAttributesObject, AssetAttributes } from "@shared/models"

namespace AssetApi {
  /**
   * Upload a file to the server.
   * @param file The file to upload.
   * @admin
   */
  export function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    return BaseApi.POSTFormData("/asset", {}, formData);
  }

  export function deleteAsset(id: string) {
    return BaseApi.DELETE(`/asset/${id}`);
  }

  /**
   * Get a list of all assets.
   * @admin
   */
  export function getAssets() {
    return BaseApi.GET("/asset").then((res) => res.json()) as Promise<AssetAttributes[]>;
  }

  export function useAssets(): [AssetAttributes[], () => Promise<void>] {
    const [assets, setAssets] = React.useState<AssetAttributes[]>([]);
    React.useEffect(() => {
      getAssets().then(setAssets);
    }, []);

    return [assets, () => getAssets().then(setAssets)];
  }
}

export default AssetApi;