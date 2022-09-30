<?php

namespace Loqate\Tag\Model\ResourceModel\SettingsData;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Loqate\Tag\Model\SettingsData as SettingsModel;
use Loqate\Tag\Model\ResourceModel\SettingsData as SettingsResourceModel;

class Collection extends AbstractCollection
{
    /**
     * Collection constructor
     */
    protected function _construct()
    {
        $this->_init(SettingsModel::class, SettingsResourceModel::class);
    }
}
