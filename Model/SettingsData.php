<?php

namespace Loqate\Tag\Model;

use Magento\Framework\Model\AbstractModel;
use Magento\Framework\DataObject\IdentityInterface;
use Loqate\Tag\Model\ResourceModel\SettingsData as SettingsResourceModel;

class SettingsData extends AbstractModel implements IdentityInterface
{
    /**
     *  Loqate cache tag
     */
    const CACHE_TAG = 'loqate_tag_settingsdata';

    /**
     * SettingsData constructor
     */
    protected function _construct()
    {
        $this->_init(SettingsResourceModel::class);
    }

    /**
     * @return array|string[]
     */
    public function getIdentities()
    {
        return [self::CACHE_TAG . '_' . $this->getId()];
    }
}
